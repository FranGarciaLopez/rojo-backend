const User = require('../models/User');
const Group = require('../models/Group');
const mongoose = require('mongoose');

async function saveGroups(eventGroups) {
  try {
    for (const group of eventGroups) {
      const newGroup = new Group({
        Users: group.users.map(userId => new mongoose.Types.ObjectId(userId)),
        interestedEvents: group.eventId.map(eventId => new mongoose.Types.ObjectId(eventId)),
        message: group.message.map(messageId => new mongoose.Types.ObjectId(messageId))
      });
      await newGroup.save();
      console.log('-'.repeat(60));
      console.log(`Group for event ${group.eventId} saved successfully.`);
      console.log(`  Group ID: ${newGroup._id}`);
      group.users.forEach(userId => {
        console.log(`\t User: ${userId}`);
      });
    }
  } catch (error) {
    console.error("Error saving groups:", error);
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
  async createGroupsForEvents() {
    try {
      console.log('Iniciando la creación de grupos para eventos...');

      const usersByInterest = await User.aggregate([
        { $unwind: "$interestedEvents" },
        {
          $group: {
            _id: "$interestedEvents",
            users: { $push: "$_id" },
          },
        },
      ]);

      console.log('Usuarios agrupados por eventos de interés:', usersByInterest);

      for (const eventGroup of usersByInterest) {
        const eventId = eventGroup._id;
        const users = eventGroup.users;

        shuffleArray(users);

        const groups = chunkArray(users, 3);

        for (const groupUsers of groups) {
          const newGroup = new Group({
            Users: groupUsers,
            interestedEvents: [eventId],
          });
          await newGroup.save();
          console.log(`Grupo para el evento ${eventId} guardado exitosamente.`);
        }
      }

      console.log('Grupos creados exitosamente.');
    } catch (error) {
      console.error('Error al crear grupos:', error);
    }
  },

  async create(req, res) {
    try {
      console.log('+'.repeat(60));
      console.log(" > Result of POST/GROUP/CREATE ");
      console.log(` > > New groups will be created and uploaded on the DB`);
      console.log('+'.repeat(60));

      const usersByInterest = await User.aggregate([
        {
          $group: {
            _id: "$interestedEvents",
            users: { $push: "$_id" },
          },
        },
        {
          $match: {
            _id: { $ne: null }
          }
        }
      ]);

      usersByInterest.forEach(event => shuffleArray(event.users));

      const eventGroups = [];
      usersByInterest.forEach(event => {
        const userChunks = chunkArray(event.users, 5);
        userChunks.forEach((chunk, index) => {
          eventGroups.push({
            eventId: event._id,
            groupNumber: index + 1,
            users: chunk,
          });
        });
      });

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

      console.log('\n > Saving groups on the DB \n ');
      await saveGroups(eventGroups);
      console.log('-'.repeat(60));
      return res.status(200).json(eventGroups);
    } catch (error) {
      console.error("Error during aggregation:", error);
      return res.status(500).json({ message: "Server error while processing users." });
    }
  },

  async getGroupById(req, res) {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;

      const group = await Group.findById(groupId).populate('users', 'name');

      if (!group) {
        return res.status(404).json({ error: 'Grupo no encontrado.' });
      }

      if (!group.users.some(user => user._id.toString() === userId)) {
        return res.status(403).json({ error: 'No tienes acceso a este grupo.' });
      }

      res.status(200).json(group);
    } catch (error) {
      console.error('Error al obtener el grupo:', error);
      res.status(500).json({ error: 'Error al obtener el grupo.' });
    }
  },

  async sendMessage(req, res) {
    try {
      const { groupId } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      if (!content || !groupId) {
        return res.status(400).json({ error: 'Message content and group ID are required.' });
      }

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
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Error sending message.' });
    }
  },

  async getMessages(req, res) {
    try {
      const { groupId } = req.params;
      const group = await Group.findById(groupId).populate('messages.sender', 'firstname lastname avatar');

      if (!group) {
        return res.status(404).json({ error: 'Group not found.' });
      }

      res.status(200).json(group.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Error fetching messages.' });
    }
  },

  async eraseAll(req, res) {
    try {
      console.log('+'.repeat(60));
      console.log("\n > Result of POST/GROUP/ERASEALL ");
      console.log(`\n > > All Groups will be erased from the DB \n`);
      console.log('+'.repeat(60));

      const result = await Group.deleteMany({});
      const text_back = result.deletedCount + ' documents deleted successfully.';
      console.log(`\n ${text_back} \n`);
      console.log('-'.repeat(60));

      res.status(200).json({ text_back });
    } catch (error) {
      console.error("Error deleting groups:", error);
      res.status(500).json({ message: 'Error getting group', error });
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

  async addUserToGroup(req, res) {
    try {
      const { groupId, userId } = req.body;

      if (!groupId || !userId) {
        return res.status(400).json({ message: 'Group ID and User ID are required' });
      }

      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (group.Users.includes(userId)) {
        return res.status(400).json({ message: 'User is already in this group' });
      }

      group.Users.push(userId);
      await group.save();

      res.status(200).json({ message: 'User added to group successfully', group });
    } catch (error) {
      console.error('Error adding user to group:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
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

  async findGroupById(req, res) {
    try {
      const { groupId } = req.params;
      if (!groupId) {
        return res.status(400).json({ error: "Group ID is required." });
      }

      const group = await Group.findById(groupId).populate('messages');

      if (!group) {
        return res.status(404).json({ error: "Group not found." });
      }

      res.status(200).json({ group });
    } catch (error) {
      console.error("Error finding group:", error);
      return res.status(500).json({ error: "Internal Server Error." });
    }
  }
};

module.exports = groupController;
