const User = require('../models/User');
const jwt = require('jsonwebtoken');
const City = require('../models/City');
const Category = require('../models/Category');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

const userController = {

       async userRegister(req, res) {
              try {
                     const { firstname, lastname, email, password, city, dateOfBirth } = req.body;

                     // Check if the user already exists
                     const userExists = await User.findOne({ email });
                     if (userExists) {
                            return res.status(409).json({ message: 'User already exists' });
                     }

                     // Check if the city exists
                     const cityDocument = await City.findOne({ name: city });
                     if (!cityDocument) {
                            return res.status(400).json({ message: 'City does not exist' });
                     }

                     // Create new user
                     const newUser = new User({
                            firstname,
                            lastname,
                            email,
                            password: password,
                            city: cityDocument._id,
                            dateOfBirth,
                            preferedCity: cityDocument._id, // Default to registration city
                            categoryName: null, // To be set during onboarding
                            dayOfTheWeek: null, // To be set during onboarding
                            isAdmin: false,
                            requiresOnboarding: true,
                            organizedEvents: 0,
                            joinedEvents: 0,
                            modifiedAt: new Date(),
                            createdAt: new Date(),
                            deletedAt: null,
                     });

                     await newUser.save();

                     res.status(201).json({
                            status: 'success',
                            message: 'User created successfully',
                     });
              } catch (error) {
                     console.error('Error during registration:', error);
                     res.status(500).json({ message: 'Registration failed' });
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
                            isAdministrator: user.isAdministrator,
                            requiresOnboarding: user.requiresOnboarding
                     });
              }
              return res.status(401).json({ message: "Invalid credentials" });
       },


       async updateUserPreferences(req, res) {
              try {
                     const { city, categoryName, dayOfTheWeek } = req.body;
                     const userId = req.user.userId; // Extract userId from the decoded token

                     // Check if the city exists
                     const cityDocument = await City.findOne({ name: city });
                     if (!cityDocument) {
                            return res.status(400).json({ message: 'City does not exist' });
                     }

                     // Check if the category exists
                     const categoryDocument = await Category.findOne({ categoryName });
                     if (!categoryDocument) {
                            return res.status(400).json({ message: 'Preferred activity does not exist' });
                     }

                     // Update the user's preferences
                     const updatedUser = await User.findByIdAndUpdate(
                            userId,
                            {
                                   preferedCity: cityDocument._id,
                                   categoryName: categoryDocument._id,
                                   dayOfTheWeek,
                                   requiresOnboarding: false,
                                   modifiedAt: new Date(),
                            },
                            { new: true }
                     );

                     if (!updatedUser) {
                            return res.status(404).json({ message: 'User not found' });
                     }

                     res.status(200).json({
                            status: 'success',
                            message: 'User preferences updated successfully, onboarding completed',
                            user: updatedUser,
                     });
              } catch (error) {
                     console.error('Error updating user preferences:', error);
                     res.status(500).json({ message: 'Error updating preferences' });
              }
       },

       async getUsers(req, res) {
              try {
                     const users = await User.find()
                            .select('-password')
                            .populate('city categoryName preferedCity');

                     res.status(200).json({
                            status: 'success',
                            users,
                     });
              } catch (error) {
                     console.error('Error fetching users:', error);
                     res.status(500).json({ message: 'Error fetching users' });
              }
       },

       async getUser(req, res) {
              try {
                     const user = await User.findOne({
                            firstname: req.user.firstname,
                            email: req.user.email,
                     })
                            .select('-password')
                            .populate('city categoryName preferedCity');

                     res.status(200).json({
                            status: 'success',
                            user,
                     });
              } catch (error) {
                     console.error('Error fetching user:', error);
                     res.status(500).json({ message: 'Error fetching user' });
              }
       },

       async forgotPassword(req, res) {
              const transporter = nodemailer.createTransport({
                     service: process.env.EMAIL_SERVICE,
                     host: process.env.SMTP_HOST,
                     port: process.env.SMTP_PORT, // e.g., 587 for TLS, 465 for SSL, or 25 for non-secure
                     secure: process.env.SMTP_SECURE === 'true', // true for SSL, false for TLS
                     auth: {
                         user: process.env.EMAIL_USER, // Your email address
                         pass: process.env.EMAIL_PASS, // Your email password or app-specific password
                     },
                 });

              try {
                     const { email } = req.body;
                     const user = await User.findOne({ email });

                     if (!user) {
                            return res.status(404).json({ message: 'Email not found' });
                     }

                     // Create a password reset token
                     const resetToken = jwt.sign(
                            { email: user.email },
                            process.env.SECRET,
                            { expiresIn: '1h' }
                     );

                     // Create a password reset link
                     const resetLink = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
                     // Send password reset email
                     await transporter.sendMail({
                            from: process.env.EMAIL_USER,
                            to: email,
                            subject: 'Password Reset',
                            html: `<p>Click <a href="${resetLink}">here</a> to reset your password</p>`,
                     });

                     // Ideally, store the reset token in the database with an expiration
                     res.status(200).json({ message: 'Password reset link sent' });
              } catch (error) {
                     console.error('Error during password reset request:', error);
                     res.status(500).json({ message: 'An error occurred while processing the password reset' });
              }
       },
};

module.exports = userController;
