// IMPORTING ----------------------
const express = require('express');
const dotenv = require("dotenv");

const usersRouter = require("./routes/usersRouter");
const eventsRouter = require("./routes/eventsRouter");
const citiesRouter = require("./routes/citiesRouter");
const groupRouter = require("./routes/groupRouter");

const cors = require('cors');

const app = express();
const seedcities = require('./scripts/seedcities');

app.use(express.json());


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
  try {
    await mongoose.connect(mongoDB);
 

  } catch (err) {
    console.log(err);
  }
}
main().catch((err) => console.log(err));



// ROUTES -------------------------
app.use('/', usersRouter);
app.use('/events', eventsRouter);
app.use('/cities', citiesRouter );
app.use('/groups', groupRouter );



// SERVER -------------------------
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = { app };
/*
USER ROUTE
    POST /register
    POST /login
    GET  /user
EVENTS ROUTE
    POST /events/eventregister
    GET  /events/events
CITIES ROUTE
    GET /cities/cities
GROUPS ROUTE
    POST /groups/create
    GET  /groups/show
*/
