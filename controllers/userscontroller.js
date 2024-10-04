

const User = require('../models/User');

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
      console.error("Error creando usuario:", error);
      res.status(500).json({ message: "Error creando usuario" }); 
  }
}

 module.exports = { userRegister };






  