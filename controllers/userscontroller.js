const User = require('../models/User');
const jwt = require('jsonwebtoken');
const City = require('../models/City');
const Category = require('../models/Category');  // Asegúrate de tener este modelo

const userController = {

       async userRegister(req, res) {
              const { firstname, lastname, email, password, city, dateOfBirth, categoryName, dayOfTheWeek } = req.body;

              const userExists = await User.findOne({ email });
              if (userExists) {
                     return res.status(409).json({ message: 'User already exists' });
              }

              let cityDocument = await City.findOne({ name: city });
              if (!cityDocument) {
                     return res.status(400).json({ message: 'City does not exist' });
              }

              let categoryDocument = await Category.findOne({ categoryName: categoryName });
              if (!categoryDocument) {
                     return res.status(400).json({ message: 'Preferred activity does not exist' });
              }

              const newUser = new User({
                     firstname,
                     lastname,
                     email,
                     password,
                     city: cityDocument._id,
                     dateOfBirth,
                     preferedCity: cityDocument._id,
                     categoryName: categoryDocument._id,
                     dayOfTheWeek,
                     isAdmin: false,
                     requiresOnboarding: true,
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

       async updateUserPreferences(req, res) {
              const { city, categoryName, dayOfTheWeek } = req.body;
              const userId = req.user.userId; // Extract userId from the decoded token

              try {
                     // Check if the city exists
                     let cityDocument = await City.findOne({ name: city });
                     if (!cityDocument) {
                            return res.status(400).json({ message: 'City does not exist' });
                     }

                     // Check if the category exists
                     let categoryDocument = await Category.findOne({ categoryName: categoryName });
                     if (!categoryDocument) {
                            return res.status(400).json({ message: 'Preferred activity does not exist' });
                     }

                     // Update the user's preferences
                     const updatedUser = await User.findByIdAndUpdate(userId, {
                            preferedCity: cityDocument._id,
                            categoryName: categoryDocument._id,
                            dayOfTheWeek: dayOfTheWeek,
                            requiresOnboarding: false,
                            modifiedAt: new Date().toISOString(), 
                     }, { new: true });

                     if (!updatedUser) {
                            return res.status(404).json({ message: 'User not found' });
                     }

                     // Return the updated user data
                     res.status(200).json({
                            status: 'success',
                            message: 'User preferences updated successfully, onboarding completed',
                            user: updatedUser,
                     });
              } catch (error) {
                     console.error(error);
                     res.status(500).json({ message: 'Error updating user preferences' });
              }
       },

       async userLogin(req, res) {
              const { email, password } = req.body;
              const user = await User.findOne({ email });

              if (user && user.password === password) {
                     const token = jwt.sign(
                            {
                                   email: user.email,
                                   firstname: user.firstname,
                                   isAdministrator: user.isAdministrator,
                                   requiresOnboarding: user.requiresOnboarding,
                                   userId: user._id
                            },
                            process.env.SECRET
                     );

                     return res.status(200).json({
                            token,
                            message: 'Login successful',
                            isAdmin: user.isAdministrator,
                            requiresOnboarding: user.requiresOnboarding
                     });
              }
              return res.status(401).json({ message: "Invalid credentials" });
       },

       async getUsers (req, res) {
              try {
                     const users = await User.find()
                            .select('-password')
                            .populate('city categoryName preferedCity'); // Populate the correct paths

                     res.status(200).json({
                            status: "success",
                            users
                     });
              } catch (error) {
                     return res.status(500).json({
                            status: "error",
                            message: "Error fetching users"
                     });
              }
       },

       async getUser(req, res) {
              try {
                     const user = await User.findOne({ firstname: req.user.firstname, email: req.user.email })
                            .select('-password')
                            .populate('city categoryName preferedCity'); // Populate the correct paths

                     res.status(200).json({
                            status: "success",
                            user
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
