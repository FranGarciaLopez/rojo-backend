// index.js
const express = require('express');
const dotenv = require("dotenv");
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const http = require('http');
const socketIo = require('socket.io');
const cron = require('node-cron');

const usersRouter = require('./routes/usersRouter');
const eventsRouter = require('./routes/eventsRouter');
const citiesRouter = require('./routes/citiesRouter');
const categoriesRouter = require('./routes/categoriesRouter');
const groupRouter = require('./routes/groupRouter');
const photosRouter = require('./routes/photosRouter');
const blogRouter = require('./routes/blogsRouter');
const groupController = require('./controllers/groupController'); // Importar el controlador de grupos

// Cargar variables de entorno
dotenv.config();

// Inicializar la aplicación
const app = express();
app.use(express.json());

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuración de CORS
app.use(cors({
  origin: 'http://localhost:5173', // Cambia esto si tu frontend está en otro dominio
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
}));

// Configuración de Multer
const upload = multer({ dest: 'uploads/' });

// Conexión a la base de datos
const mongoDB = `mongodb+srv://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASSWORD)}@${process.env.DB_SERVER}/${process.env.DB_NAME}?retryWrites=true&w=majority`;

async function main() {
  try {
    await mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Database connected successfully');
  } catch (err) {
    console.error('Database connection error:', err);
  }
}
main();

// Rutas
app.use('/', usersRouter);
app.use('/events', eventsRouter);
app.use('/cities', citiesRouter);
app.use('/categories', categoriesRouter);
app.use('/groups', groupRouter);
app.use('/photos', photosRouter);
app.use('/forgotpassword', usersRouter);
app.use('/blogs', blogRouter);

// Crear servidor y adjuntar Socket.IO
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Cambia esto para restringir el origen si es necesario
    methods: ['GET', 'POST'],
  },
});

// Configurar eventos de Socket.IO
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join a group chat room
  socket.on('joinGroup', (groupId) => {
    socket.join(groupId);
    console.log(`Socket ${socket.id} joined group ${groupId}`);
  });

  // Leave a group chat room
  socket.on('leaveGroup', (groupId) => {
    socket.leave(groupId);
    console.log(`Socket ${socket.id} left group ${groupId}`);
  });

  // Send a message to a group
  socket.on('sendMessage', async ({ groupId, userId, content }) => {
    try {
      const group = await Group.findById(groupId);

      if (!group || !group.Users.includes(userId)) {
        socket.emit('error', 'You are not part of this group.');
        return;
      }

      const message = { sender: userId, content, timestamp: new Date() };
      group.messages.push(message);
      await group.save();

      // Broadcast the message to the group
      io.to(groupId).emit('receiveMessage', {
        sender: userId,
        content,
        timestamp: message.timestamp,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', 'Error sending message.');
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

});

// Iniciar el servidor
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Programar la tarea con node-cron
// Esta tarea se ejecutará cada viernes a las 00:00
//cron.schedule('*/2 * * * *', () => {
  //console.log('Ejecutando la tarea de agrupamiento de usuarios cada 2 minutos...');
  //groupController.createGroupsForEvents(); // Asegúrate de que este método está definido correctamente
//});

module.exports = { app };
