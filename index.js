// Server Socket.io messages
const  {Server} = require('socket.io');
const {createServer} = require ('http');


// server.js
const express = require('express');
const dotenv = require("dotenv");




const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const usersRouter = require('./routes/usersRouter');
const eventsRouter = require('./routes/eventsRouter');
const citiesRouter = require('./routes/citiesRouter');
const categoriesRouter = require('./routes/categoriesRouter');
const groupRouter = require('./routes/groupRouter');
const photosRouter = require('./routes/photosRouter');
const blogRouter = require('./routes/blogsRouter');
const Message = require('./models/Message');
const Group = require('./models/Group');
const User = require('./models/User');




// Load environment variables
dotenv.config();

// Initialize the app
const app = express();
const server = createServer(app);

app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',  
    methods: ['GET', 'POST'],       
  }
});

io.on('connection', (socket) => {
  console.log(`Usuario conectado: ${socket.id}  `);

  // Unirse a un grupo
  socket.on('joinGroup', (groupId) => {
    socket.join(groupId);
    console.log(`Usuario ${socket.firstname}   se unió al grupo: ${groupId}`);
  });



  socket.on('sendMessage', async ({ groupId, userId, content }) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        console.error('Usuario no encontrado');
        return;
      }
  
      const firstname = user.firstname;
      console.log(firstname);
  
      const message = new Message({ group: groupId, author: userId, content });
      await message.save();
  
      await Group.findByIdAndUpdate(groupId, { $push: { messages: message._id } });
  
      // Emitir el mensaje a todos los miembros del grupo
      io.to(groupId).emit('receiveMessage', {
        groupId,
        author: firstname,
        content,
        timestamp: message.timestamp,
      });
  
      // Emitir el mensaje al cliente que lo envió (opcional)
      socket.emit('messageSent', {
        groupId,
        author: firstname,
        content,
        timestamp: message.timestamp,
      });
  
      console.log('Mensaje enviado:', message);
    } catch (err) {
      console.error('Error enviando mensaje:', err);
    }
  });


  socket.on('disconnect', () => {
    console.log(`Usuario desconectado: ${socket.id}`);
  });
});


// Set up Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
}));

// Multer configuration
const upload = multer({ dest: 'uploads/' });

// Database connection
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

// Routes
app.use('/', usersRouter);
app.use('/events', eventsRouter);
app.use('/cities', citiesRouter);
app.use('/categories', categoriesRouter);
app.use('/groups', groupRouter);
app.use('/photos', photosRouter);
app.use('/forgotpassword', usersRouter);
app.use('/blogs', blogRouter);

// Start the server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});





module.exports = { app };
