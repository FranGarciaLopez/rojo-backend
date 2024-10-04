// IMPORTING ----------------------
const express = require('express');
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const users = require("./database/users");
const authMiddlewares = require("./middlewares");
const app = express();
const port = 3000;
const usersRouter = require('./routes/usersRouter');

// DB SETTING --------------------
dotenv.config();
require("dotenv").config();
const mongoose = require("mongoose");
const mongoDB =
  "mongodb+srv://" +
  process.env.DB_USER +
  ":" +
  process.env.DB_PASSWORD +
  "@" +
  process.env.DB_SERVER +
  "/" +
  process.env.DB_NAME +
  "?retryWrites=true&w=majority";
async function main() {
  await mongoose.connect(mongoDB);
}
main().catch((err) => console.log(err));

// ROUTER -----------------------------
app.use(express.json());
app.use('/users', usersRouter);

// Listening ---------------------------------------------------
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
module.exports = { app };