
const express = require('express');

const app = express();
app.use(express.json());

const usersRouter = require('./routes/usersRouter');

app.use('/users', usersRouter);



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

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

module.exports = { app };