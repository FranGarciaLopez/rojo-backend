const User = require('../models/User');
const Group = require('../models/Group');
const mongoose = require('mongoose');
async function saveGroups(eventGroups) {
    try {
        for (const group of eventGroups) {
            const newGroup = new Group({
                Users: group.users.map(userId => mongoose.Types.ObjectId(userId)),
                interestedEvents: group.eventId.map(eventId => mongoose.Types.ObjectId(eventId)),
                messages: [],
            });
            const savedGroup = await newGroup.save();

            // Update each user to reference this group
            for (const userId of group.users) {
                await User.findByIdAndUpdate(userId, {
                    $push: { groups: savedGroup._id },
                });
            }
        }
    } catch (error) {
        console.error('Error saving groups:', error);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
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

    async create(req, res) {
        try {
            /* console.log("+".repeat(60)); */
            /* console.log(" > Starting group creation process"); */
    
            // Group users by interested events
            const usersByInterest = await User.aggregate([
                {
                    $match: { interestedEvents: { $exists: true, $ne: [] } },
                },
                {
                    $group: {
                        _id: null, // Group all users together
                        users: { $push: "$_id" },
                    },
                },
            ]);
    
            if (!usersByInterest.length) {
                /* console.log("No users with interested events found."); */
                return res
                    .status(404)
                    .json({ success: false, message: "No users with interested events found." });
            }
    
            const allUsers = usersByInterest[0].users;
    
            // Shuffle users
            shuffleArray(allUsers);
    
            // Split users into groups of 2
            const groups = [];
            for (let i = 0; i < allUsers.length; i += 2) {
                const groupUsers = allUsers.slice(i, i + 2);
                if (groupUsers.length === 2) {
                    groups.push(groupUsers);
                }
            }
    
            if (!groups.length) {
                /* console.log("No valid groups could be created."); */
                return res
                    .status(400)
                    .json({ success: false, message: "No valid groups could be created." });
            }
    
            /* console.log(" > Saving groups to the database"); */
    
            const usedEvents = new Set(); // Track used event IDs
    
            for (const groupUsers of groups) {
                // Find a unique event for the group
                let selectedEventId = null;
    
                for (const userId of groupUsers) {
                    const user = await User.findById(userId);
    
                    if (user && user.interestedEvents.length) {
                        // Find the first event not already used
                        selectedEventId = user.interestedEvents.find(
                            (eventId) => !usedEvents.has(eventId.toString())
                        );
                        if (selectedEventId) break;
                    }
                }
    
                if (!selectedEventId) {
                    /* console.error("No available unique event for the group."); */
                    continue; // Skip this group if no unique event is available
                }
    
                usedEvents.add(selectedEventId.toString()); // Mark this event as used
    
                // Create and save the group
                const newGroup = new Group({
                    Users: groupUsers.map((userId) => new mongoose.Types.ObjectId(userId)),
                    interestedEvents: [new mongoose.Types.ObjectId(selectedEventId)],
                });
    
                const savedGroup = await newGroup.save();
                /* console.log(
                    `Group ${savedGroup._id} created successfully with users: ${groupUsers}`
                ); */
    
                // Update users with the new group
                const updateResults = await User.updateMany(
                    { _id: { $in: groupUsers } },
                    { $push: { groups: savedGroup._id } }
                );
                /* console.log("User update results:", updateResults); */
            }
    
            /* console.log("-".repeat(60)); */
            return res
                .status(200)
                .json({ success: true, message: "Groups created successfully" });
        } catch (error) {
            /* console.error("Error during group creation:", error); */
            return res.status(500).json({ success: false, error: error.message });
        }
    },    

    async sendMessage(req, res) {
        try {
            const { groupId } = req.params;
            const { content } = req.body;
            const userId = req.user.userId;

            const group = await Group.findById(groupId);
            if (!group) {
                return res.status(404).json({ error: 'Group not found.' });
            }

            if (!group.Users.includes(userId)) {
                return res.status(403).json({ error: 'You are not part of this group.' });
            }

            const message = { sender: userId, content, timestamp: new Date() };
            group.messages.push(message);
            await group.save();

            res.status(200).json({ message: 'Message sent successfully.', message });
        } catch (error) {
            res.status(500).json({ error: 'Error sending message.' });
        }
    },

    async getMessages(req, res) {
        try {
            const { groupId } = req.params;
            const group = await Group.findById(groupId).populate('messages.sender', 'firstname lastname');

            if (!group) {
                return res.status(404).json({ error: 'Group not found.' });
            }

            res.status(200).json(group.messages);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching messages.' });
        }
    },

    async eraseAll(req, res) {
        try {
            /* console.log('+'.repeat(60));
            console.log("\n > Result of POST/GROUP/ERASEALL ");
            console.log(`\n > > All Groups will be erased from the DB \n`);
            console.log('+'.repeat(60)); */

            const result = await Group.deleteMany({});
            const text_back = result.deletedCount + ' documents deleted successfully.';
            /* console.log(`\n ${text_back} \n`);
            console.log('-'.repeat(60)); */

            res.status(200).json({ text_back });
        } catch (error) {
            /* console.error("Error deleting groups:", error); */
            res.status(500).json({ message: 'Error deleting groups.', error });
        }
    },

    async showAll(req, res) {
        try {
            const groups = await Group.find().populate('Users', 'firstname lastname _id').exec();

            console.log('+'.repeat(60));
            console.log("\n > Result of GET/GROUP/SHOWALL ");
            console.log(`\n > > All Groups available will follow \n`);
            console.log('+'.repeat(60));

            groups.forEach((group, index) => {
                console.log(`Group ${index + 1}:`);
                console.log(`  Group ID: ${group._id}`);
                console.log(`  Interested Events: ${group.interestedEvents}`);
                console.log(`  Users:`);
                group.Users.forEach(user => {
                    console.log(`    - ${user._id}`);
                });
                console.log('-'.repeat(60));
            });

            res.status(200).json(groups);
        } catch (error) {
            console.error("Error fetching groups:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    async findGroup(req, res) {
        try {
            const { userId } = req.body;
            if (!userId) {
                return res.status(400).json({ error: "User ID is required." });
            }

            const userObjectId = new mongoose.Types.ObjectId(userId);
            const groups = await Group.find({ Users: userObjectId });

            console.log('+'.repeat(60));
            console.log("\n > Result of POST/GROUP/FINDGROUP ");
            console.log(`\n > > All Groups of ${userObjectId} will follow \n`);
            console.log('+'.repeat(60));

            groups.forEach((group, index) => {
                console.log(`Group ${index + 1}:`);
                console.log(`  Group ID: ${group._id}`);
                console.log(`  Interested Events: ${group.interestedEvents}`);
                console.log(`  Users:`);
                group.Users.forEach(user => {
                    console.log(`    - ${user._id}`);
                });
                console.log('-'.repeat(60));
            });

            res.status(200).json({ groups });
        } catch (error) {
            console.error("Error finding groups for user:", error);
            return res.status(500).json({ error: "Internal Server Error." });
        }
    },

    async findGroupsByUser(req, res) {
        try {
            const { userId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ error: "Invalid user ID." });
            }

            const groups = await Group.find({ Users: userId })
                .populate({
                    path: "messages",
                    populate: { path: "author", select: "firstname lastname" },
                })
                .populate("Users", "firstname lastname email");

            res.status(200).json(groups);
        } catch (error) {
            console.error("Error finding groups by user:", error);
            res.status(500).json({ error: "Internal Server Error." });
        }
    },

    async findGroupById(req, res) {
        try {
            const { groupId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(groupId)) {
                return res.status(400).json({ error: "Invalid group ID." });
            }

            const group = await Group.findById(groupId)
                .populate({
                    path: "messages",
                    populate: { path: "author", select: "firstname lastname" },
                })
                .populate("Users", "firstname lastname email"); // Populate Users field for debug

            if (!group) {
                return res.status(404).json({ error: "Group not found." });
            }

            console.log("Fetched Group:", group); // Debugging log
            res.status(200).json(group);
        } catch (error) {
            console.error("Error finding group:", error);
            res.status(500).json({ error: "Internal Server Error." });
        }
    }
};

module.exports = groupController;