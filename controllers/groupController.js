const jwt = require('jsonwebtoken');
const City = require('../models/City');
const Group = require('../models/Group');
const User = require('../models/User');
const Event = require('../models/Event');
const mongoose = require("mongoose");

async function saveGroups(eventGroups) {
  try {
    // Iterate through the groups and save them to the database
    for (const group of eventGroups) {
      // Create a new group document for each event
      const newGroup = new Group({
        Users: group.users.map(userId => new mongoose.Types.ObjectId(userId)),  // Map each userId to an ObjectId
        interestedEvents: group.eventId.map(eventId => new mongoose.Types.ObjectId(eventId)) // Map each eventId to an ObjectId
      });
      const dashes0 = '-'.repeat(60);
      // Save the group to the database
      await newGroup.save();
      //console.log(`Group for event ${group.eventId} `)
      console.log(dashes0)
      console.log(`Group for event ${group.eventId} saved successfully.`);
      console.log(`  Group ID: ${newGroup._id}`); // Print the group ID
      group.users.forEach(userId => {
        console.log(`\t User: ${userId}`);
      }); 
       }
  } catch (error) {
    console.error("Error saving groups:", error);
  }
}

function shuffleArray(array) {
  // Fisher-Yates (Knuth) shuffle
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Random index
    // Swap elements at indices i and j
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function chunkArray(array, chunkSize) {
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

const groupController = {
  /************************************************/ 
    async eraseall(req, res) { 
      try {
        // Delete all documen ts in the Group collection
        console.log('+'.repeat(60));
        console.log("\n > Result of POST/GROUP/ERASEALL ");
        console.log(`\n > > All Groups will be erased from the DB \n`);
        console.log('+'.repeat(60));

        const result = await Group.deleteMany({});
        text_back = result.deletedCount + 'documents deleted successfully.'
        console.log(`\n ${result.deletedCount} documents deleted successfully. \n`);
        console.log('-'.repeat(60));

        res.status(200).json({text_back});

      } catch (error) {
        console.error("Error deleting groups:", error);
        res.status(500).json({ message: 'Error getting group', error });
      }
    },
  /************************************************/
    async showall(req, res){
    try {
      // Fetch all groups from the database
      const groups = await Group.find().populate('Users', '_id').exec();
      // Log each group in the terminal

      console.log('+'.repeat(60));
      console.log("\n > Result of GET/GROUP/SHOWALL ");
      console.log(`\n > > All Groups available will follow \n`);
      console.log('+'.repeat(60));

      groups.forEach((group, index) => {
        console.log(`Group ${index + 1}:`);
        console.log(`  Group ID: ${group._id}`); // Print the group ID
        console.log(`  Interested Events: ${group.interestedEvents}`);
        console.log(`  Users:`);
        group.Users.forEach(user => {
          console.log(`    - ${user._id}`);
        });
        console.log('-'.repeat(60));
      });
  
      // Send all groups as JSON response
      res.status(200).json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

    /************************************************/
    async findgroup(req, res) { 
      try {
          const { userId } = req.body; // Extract userId from the request body
          if (!userId) {
            return res.status(400).json({ error: "User ID is required." });
          }
          // Convert the userId to ObjectId
          const userObjectId = new mongoose.Types.ObjectId(userId);
          // Query the Group collection for groups containing the user
          const groups = await Group.find({ Users: userObjectId });
          console.log('+'.repeat(60));
          console.log("\n > Result of POST/GROUP/FINDGROUP ");
          console.log(`\n > > All Groups of ${userObjectId} will follow \n`);
          console.log('+'.repeat(60));

          groups.forEach((group, index) => {
            console.log(`Group ${index + 1}:`);
            console.log(`  Group ID: ${group._id}`); // Print the group ID
            console.log(`  Interested Events: ${group.interestedEvents}`);
            console.log(`  Users:`);
            group.Users.forEach(user => {
              console.log(`    - ${user._id}`);
            });
            console.log('-'.repeat(60));
          });

          
          //  console.log(groups);
            res.status(200).json({groups});
      } catch (error) {
        console.error("Error finding groups for user:", error);
        return res.status(500).json({ error: "Internal Server Error." });
      }
    },
    //******************************************** */
    async create(req, res) {
      //process.stdout.write('\x1Bc');
      try {
        console.log('+'.repeat(60));
        console.log(" > Result of POST/GROUP/CREATE ");
        console.log(` > > New groups will be created and uploaded on the DB`);
        console.log('+'.repeat(60));
        // * QUERY ************************************************************************
        const usersByInterest = await User.aggregate([
          {
            $group: {
              _id: "$interestedEvents", // Group by interestedEvents
              users: { $push: "$_id" },  // Collect user IDs
            },
          },
          {
            $match: {
              _id: { $ne: null } // Exclude groups where '_id' (the interestedEvents) is null
            }
          }
        ]);
        /**********************************************************************************/
        // shuffle **************************************************************************
        usersByInterest.forEach(event => {  shuffleArray(event.users); });

          const eventGroups = [];
                // Iterate over each event to group its users ***************************/
                usersByInterest.forEach(event => {
                    // Chunk the users into groups of 5
                    const userChunks = chunkArray(event.users, 5);
                        // For each chunk, create an object with event id, group number, and users
                        userChunks.forEach((chunk, index) => {
                          eventGroups.push({
                            eventId: event._id,          // Event ID
                            groupNumber: index + 1,      // Group number (starting from 1)
                            users: chunk,                // List of users in this group
                          });
                        });
                 });
                 /* Printing report *****************************************************/
                console.log(' > Reporting created groups ');
                console.log('-'.repeat(60));
                console.log(' group.eventId | group.groupNumber |userId ');
        console.log('-'.repeat(60));
                  eventGroups.forEach(group => {
                        group.users.forEach(user => {
                          console.log(`${group.eventId} | ${group.groupNumber}| ${user}`);
                      });
                      console.log('-'.repeat(60));
                    });
                  /*********************************************************************/
    console.log('\n > Saving groups on the DB \n ');
    await saveGroups(eventGroups);
    console.log('-'.repeat(60));
     return res.status(404).json(eventGroups);
      } catch (error) {
        console.error("Error during aggregation:", error);
        return res.status(500).json({ message: "Server error while processing users." });
      }
    }
  };
module.exports = groupController;