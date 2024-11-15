const jwt = require('jsonwebtoken');
const City = require('../models/City');
const Group = require('../models/Group');
const User = require('../models/User');
const Event = require('../models/Event');

const groupController = {
    async show(req, res) {
        try {
          const textback = "Here the code to receive the group";
          console.log(textback);
          res.status(200).json({textback});
        } catch (error) {
            console.error('Error getting the group:', error);
            res.status(500).json({ message: 'Error getting group', error });
        }
    },
    async create(req, res) {
      process.stdout.write('\x1Bc'); // clear the terminal
      console.log(" > Starting Aggregation Pipeline (6steps)");
      try {
        const usersWithSameFirstnameAndCity = await User.aggregate([
          { // Step 1: Group users by 'firstname' and 'city'
            $group: { 
              _id: { firstname: "$firstname", city: "$city" },
              count: { $sum: 1 },
              users: { $push: "$$ROOT" }  
            } 
          },
          { // Step 2: Filter the groups to keep only those with more than 2 users
            $match: { 
              count: { $gt: 2 } 
            } 
          },
          { // Step 3: Shuffle the users in each group by adding a random value to each user
            $addFields: {
              users: { 
                $map: {
                  input: "$users",  
                  as: "user",
                  in: {
                    $mergeObjects: [
                      "$$user", 
                      { rand: { $rand: {} } }  
                    ]
                  }
                }
              }
            }
          },
          { // Step 4: Sort users by the random value
            $addFields: {
              users: { 
                $sortArray: { input: "$users", sortBy: { rand: 1 } }
              }
            }
          },
          { // Step 5: Group users into subgroups of 5
            $project: { 
              _id: 0,
              firstname: "$_id.firstname",
              city: "$_id.city",
              groupedUsers: {
                $map: {
                  input: { $range: [0, { $ceil: { $divide: ["$count", 5] } }] },
                  as: "index",
                  in: { 
                    $slice: ["$users", { $multiply: ["$$index", 5] }, 5]  
                  }
                }
              }
            }
          },
          { // Step 6: Lookup events based on the city
            $lookup: {
              from: "events",
              localField: "city",
              foreignField: "city",
              as: "events"
            }
          },
          { 
            $project: { 
              firstname: 1,
              city: 1,
              groupedUsers: 1,
              events: 1
            }
          }
        ]);
        console.log(" > Computation Compelted...");
        // Log the final result
        console.log(' > Users with events:', usersWithSameFirstnameAndCity);

        console.log("\n\n > Reporting...\n");
            const dashes = '-'.repeat(120);
            console.log(('G no.').padStart(9) + '|'+('City ').padStart(26) +'|' + ('user._id ').padStart(26) +'|'+ ('firstname').padStart(13) + ' |'+('lastname').padStart(13) +' |   user.events ' );
            console.log(dashes);

          try {
            let GroupNum = 0;
            for (let group of usersWithSameFirstnameAndCity) {
              const { groupedUsers, events } = group;
              for (let subgroup of groupedUsers) {
                let headerBool = false;
                GroupNum = GroupNum+1;
                for (let user of subgroup) {
                  group_num = GroupNum.toString();
                  group_num_text = 'G no. '+ group_num.padStart(2)
                  await User.findByIdAndUpdate(user._id, { $set: { events: events.map(event => event._id) } });
                  console.log(group_num_text + ' | ' + user.city + ' | ' + user._id + ' |' + user.firstname.padStart(13) +  ' |' + user.lastname.padStart(13) +  ' | '+  user.events  );
                }
                console.log(dashes);
              }
            }
            console.log("\n > Users' events updated successfully.");
          } catch (error) {
            console.error("Error updating users' events:", error);
          }
            res.status(300).json({usersWithSameFirstnameAndCity });      
      } catch (error) {
          console.error('Error creating the group:', error);
          res.status(500).json({ message: 'Error creating group', error });
      }
    }
  };
module.exports = groupController;