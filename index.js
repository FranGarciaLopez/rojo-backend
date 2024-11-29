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

// Load environment variables
dotenv.config();

// Initialize the app
const app = express();
app.use(express.json());

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
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});





module.exports = { app };
