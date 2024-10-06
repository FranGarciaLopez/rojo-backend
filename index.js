// IMPORTING ----------------------
const express = require('express');
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const users = require("./database/users");
const authMiddlewares = require("./middlewares");
const usersRouter= require("./routes/usersRouter");

const app = express();
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
      console.log("Conexión a MongoDB exitosa");
  } catch (err) {
    console.log("Error conectando a MongoDB:", err);
  }
}
main().catch((err) => console.log(err));

// ROUTES -----------------------------
app.use(express.json());

  app.get("/", (req, res) => {
    res.send("Hello World 2!");
  });

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find((userDB) => userDB.username === username);
  if (user && user.password === password) {
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.SECRET
    );
    return res.status(201).send({ token });
  }
  return res.status(401).send("Username or password is not correct");
});

  app.get("/user", authMiddlewares.validateToken, (req, res) => {
    const user = users.find((userDB) => userDB.id === req.user.id);
    res.status(200).send(user);
  });

app.get("/secret", (req, res) => {
  res.send(require("crypto").randomBytes(32).toString("hex"));
});

// Listening ---------------------------------------------------
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
module.exports = { app };