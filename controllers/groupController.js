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
      try {
        const textback = "Here the code to create the group";
        console.log(textback);
        /**********************************************************************************************
          Idea - when there is a perfect match among the three options (city, category, Day of the week) 
                    available in the USER entity, a new GROUP will be created (AGGREGATION PIPELINE). 
          ***********************************************************************************************/
          /******************** STEP 1 - Get all the users with same preferences ************************/
        // SAME FIRST NAME ************************************
 /*         const usersWithSameFirstname = await User.aggregate([
            { $group: { _id: "$firstname", count: { $sum: 1 }, user: { $push: "$$ROOT" } } },
            { $match: { count: { $gt: 1 } } }, // Only keep groups with more than one user
            { $project: { _id: 0, firstname: "$_id", user: 1 } } // Optional: remove _id and rename fields
          ]);
          console.log('Users found with the same firstname:', usersWithSameFirstname);
          res.status(500).json({ message: 'here', usersWithSameFirstname });
  */        
         // SAMFE FIRST NAME AND SAME CITY ****************************
            // Aggregation pipeline to find users with the same firstname "Pedro" and city
    const usersWithSameFirstnameAndCity = await User.aggregate([
      { 
        // Group users by both 'firstname' and 'city' fields
        // This will create groups for each unique firstname-city combination
        $group: { 
          _id: { firstname: "$firstname", city: "$city" },  // Group key: combination of firstname and city
          count: { $sum: 1 },  // Count the number of users in each group
          users: { $push: "$$ROOT" }  // Collect all user documents in each group
        } 
      },
      { 
        // Filter groups to keep only those where:
        // - firstname is "Pedro"
        // - there is more than one user in the same city with this firstname
        $match: { 
          "_id.firstname": "Pedro",  // Only groups where firstname is "Pedro"
          count: { $gt: 1 }  // Only groups with more than one user (duplicates)
        } 
      },
      { 
        // Project the final output format:
        // - Remove '_id' field from output for cleaner JSON
        // - Rename fields for clarity in the response
        $project: { 
          _id: 0,  // Exclude '_id' field
          firstname: "$_id.firstname",  // Rename '_id.firstname' to 'firstname'
          city: "$_id.city",  // Rename '_id.city' to 'city'
          users: 1  // Include 'users' array as it is
        } 
      }
    ]); 
        // Step 2: Get all unique cities from the results
    const cities = usersWithSameFirstnameAndCity.map(group => group.city);

// Step 3: Use Promise.all to find events in each city concurrently
    const eventsInSameCities = await Promise.all(
      cities.map(async city => {
        const eventsInCity = await Event.find({ city: city });
        // If there are events in the city, return an object with city and events
        return eventsInCity.length > 0 ? { city, events: eventsInCity } : null;
      })

    );

    // Filter out any null values where no events were found
    const filteredEvents = eventsInSameCities.filter(result => result !== null);
    // Log the events found in each city to the console
    filteredEvents.forEach(({ city, events }) => {
      console.log(`Events found in city "${city}":`, events);
    });

        console.log('Users found with the same firstname:', usersWithSameFirstnameAndCity);
        res.status(300).json({usersWithSameFirstnameAndCity });      
        /******************** STEP 2 - Save all those users in a new group on the DB ******************/
      } catch (error) {
          console.error('Error creating the group:', error);
          res.status(500).json({ message: 'Error creating group', error });
      }
    }
  };

module.exports = groupController;