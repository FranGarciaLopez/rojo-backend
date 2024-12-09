// IMPORTING ----------------------
const express = require('express');
const dotenv = require("dotenv");
const usersRouter = require("./routes/usersRouter");
const eventsRouter = require("./routes/eventsRouter");
const citiesRouter = require("./routes/citiesRouter");

const groupRouter = require("./routes/groupRouter");
const photosRouter = require("./routes/photosRouter");
const categoriesRouter = require("./routes/categoriesRouter");
const blogRouter = require("./routes/blogsRouter");

const cors = require('cors');

const app = express();

multer = require("multer");
const upload = multer({dest:"uploads/"});
const cloudinary = require("cloudinary").v2;


app.use(express.json());

require('dotenv').config();

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


// CORS -----------------------------
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
}));

const port = 3000;

// DB SETTING --------------------
dotenv.config();

const mongoose = require("mongoose");
const encodePassword = encodeURIComponent(process.env.DB_PASSWORD);

const mongoDB =
  "mongodb+srv://" +
  process.env.DB_USER +
  ":" +
  encodePassword +
  "@" +
  process.env.DB_SERVER +
  "/" +
  process.env.DB_NAME +
  "?retryWrites=true&w=majority";

async function main() {
  if (process.env.NODE_ENV !== 'test') { // Skip connection during tests
    try {
      await mongoose.connect(mongoDB);
      
    } catch (err) {
      console.log(err);
    }
  }
}
main().catch((err) => console.log(err));

// ROUTES -------------------------
app.use('/', usersRouter);
app.use('/events', eventsRouter);
app.use('/cities', citiesRouter);
app.use('/categories', categoriesRouter);
app.use('/groups', groupRouter);
app.use('/photos', photosRouter);
app.use('/blogs', blogRouter);

// SERVER -------------------------
if (process.env.NODE_ENV !== 'test') { // Skip connection during tests
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app ;

//module.exports = { app };
