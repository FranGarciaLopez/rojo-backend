const User = require('../models/User');
const Group = require('../models/Group');

const groupController = {
     // Otros métodos...

     async createGroupsForEvents() {
          try {
               console.log('Iniciando la creación de grupos para eventos...');

               // Actualizar la agregación para manejar arrays
               const usersByInterest = await User.aggregate([
                    { $unwind: "$interestedEvents" }, // Descomponer el array
                    {
                         $group: {
                              _id: "$interestedEvents", // Agrupar por cada evento
                              users: { $push: "$_id" },  // Coleccionar los IDs de los usuarios
                         },
                    },
               ]);

               console.log('Usuarios agrupados por eventos de interés:', usersByInterest);

               // Para cada evento, crear grupos
               for (const eventGroup of usersByInterest) {
                    const eventId = eventGroup._id;
                    const users = eventGroup.users;

                    shuffleArray(users);

                    // Dividir en grupos de 3 personas
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
               await createGroupsForEvents(); // Llama a tu función de agrupamiento
               res.status(200).json({ message: 'Grupos creados exitosamente.' });
          } catch (error) {
               console.error('Error al crear grupos:', error);
               res.status(500).json({ error: 'Error al crear grupos.' });
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

               // Verificar si el usuario pertenece al grupo
               if (!group.users.some((user) => user._id.toString() === userId)) {
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

               // Check if the user belongs to the group
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
};

// Funciones auxiliares
function shuffleArray(array) {
     // Algoritmo de Fisher-Yates
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

module.exports = groupController;
