const User = require('../models/User');
const jwt = require('jsonwebtoken');
// const City = require('../models/City');

const userController = {

  async userRegister(req, res) {
    const { firstname, lastname, email, password, city, dateOfBirth } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const newUser = new User({
      firstname,
      lastname,
      email,
      password,
      city,
      dateOfBirth,
      isAdmin: false,
      organizedEvents: 0,
      joinedEvents: 0,
      modifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      deletedAt: null,
    });

    await newUser.save();
    res.status(201).json({
      status: 'success',
      message: 'User created successfully'
    });
  },

  async userLogin(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && user.password === password) {
      const token = jwt.sign(
        { email: user.email, firstname: user.firstname, isAdministrator: user.isAdministrator },
        process.env.SECRET
      );
      return res.status(200).send({ token });
    }
    return res.status(401).json({ message: "Invalid credentials" });
  },

  async getUser(req, res) {
    try {
      const user = await User.findOne({ firstname: req.user.firstname, email: req.user.email })
        .populate('city')

      res.status(200).json({
        status: "success",
        user,
      });
    } catch (error) {

      return res.status(500).json({
        status: "error",
        message: "Error fetching users"
      });
    }
  }
};

module.exports = userController;