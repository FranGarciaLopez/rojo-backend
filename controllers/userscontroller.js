

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const middlewares = require('../middlewares');
const dotenv = require("dotenv");


async function userRegister(req, res) {
  const newUser = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: req.body.password,
      city: req.body.city,
      dateOfBirth: new Date(req.body.dateOfBirth),
      isAdministrator: req.body.isAdministrator,
  });

  try {
      const savedUser = await newUser.save(); 
      res.status(201).json(savedUser); 
  } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Error creating user:" }); 
  }
}

async function userLogin (req,res){
    const { email, password } = req.body;
        const user = await User.findOne({ email });

        console.log("usuario" ,user);

  if (user && user.password === password) {

  
    const token = jwt.sign(
      { email: user.email, firstname: user.firstname },
     process.env.SECRET
    );
    return res.status(201).send({ token });
  }
  return res.status(401).send("Username or password is not correct");


}


async function getAllUsers(req, res) {
    try {
        const users = await User.find(); 
        return res.status(200).json(users); 
    } catch (error) {
        console.error("Error getting users:", error);
        return res.status(500).send("Error getting users");
    }
}







 module.exports = { userRegister , userLogin, getAllUsers};






  