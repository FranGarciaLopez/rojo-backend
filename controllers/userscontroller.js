const User = require('../models/User');
const City = require('../models/City');
const Category = require('../models/Category');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cloudinary = require("cloudinary").v2;

cloudinary.config({
       cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
       api_key: process.env.CLOUDINARY_API_KEY,
       api_secret: process.env.CLOUDINARY_API_SECRET,
});

const userController = {
       // Register a new user
       async userRegister(req, res) {
              try {
                     const { firstname, lastname, email, password, city, dateOfBirth } = req.body;

                     // Check if user already exists
                     const userExists = await User.findOne({ email });
                     if (userExists) {
                            return res.status(409).json({ message: 'User already exists' });
                     }

                     // Validate city
                     const cityDocument = await City.findOne({ name: city });
                     if (!cityDocument) {
                            return res.status(400).json({ message: 'City does not exist' });
                     }


                     // Hash the password
                     const hashedPassword = await bcrypt.hash(password, 10);

                     // Create a new user
                     const newUser = new User({
                            firstname,
                            lastname,
                            email,
                            password: hashedPassword,
                            city: cityDocument._id,
                            dateOfBirth,
                            isAdministrator: false,
                            requiresOnboarding: true,
                            organizedEvents: 0,
                            joinedEvents: 0,
                            modifiedAt: new Date(),
                            createdAt: new Date(),
                            deletedAt: null,
                     });

                     await newUser.save();

                     res.status(201).json({ message: 'User created successfully' });
              } catch (error) {
                     console.error('Error during registration:', error);
                     res.status(500).json({ message: 'An error occurred during registration' });
              }
       },

       // User login
       async userLogin(req, res) {
              try {
                     const { email, password } = req.body;

                     const user = await User.findOne({ email });
                     if (!user) {
                            return res.status(401).json({ message: "Invalid credentials" });
                     }

                     // Compare passwords
                     const isPasswordValid = await bcrypt.compare(password, user.password);
                     if (!isPasswordValid) {
                            return res.status(401).json({ message: "Invalid credentials" });
                     }

                     // Generate JWT
                     const token = jwt.sign(
                            {
                                   email: user.email,
                                   firstname: user.firstname,
                                   isAdministrator: user.isAdministrator,
                                   requiresOnboarding: user.requiresOnboarding,
                                   userId: user._id,
                                   avatar: user.avatar,
                            },
                            process.env.SECRET
                     );

                     res.status(200).json({
                            token,
                            message: 'Login successful',
                            isAdministrator: user.isAdministrator,
                            requiresOnboarding: user.requiresOnboarding,
                     });
              } catch (error) {
                     console.error('Error during login:', error);
                     res.status(500).json({ message: 'An error occurred during login' });
              }
       },

       // Update user preferences
       async updateUserPreferences(req, res) {
              try {
                     const { city, categoryName, dayOfTheWeek } = req.body;
                     const userId = req.user.userId;

                     // Validate city
                     const cityDocument = await City.findOne({ name: city });
                     if (!cityDocument) {
                            return res.status(400).json({ message: 'City does not exist' });
                     }

                     // Validate category
                     const categoryDocument = await Category.findOne({ categoryName });
                     if (!categoryDocument) {
                            return res.status(400).json({ message: 'Preferred activity does not exist' });
                     }

                     // Update user
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
                            message: 'User preferences updated successfully',
                            user: updatedUser,
                     });
              } catch (error) {
                     console.error('Error updating user preferences:', error);
                     res.status(500).json({ message: 'Error updating preferences' });
              }
       },

       // Get all users
       async getUsers(req, res) {
              try {
                     const users = await User.find()
                            .select('-password')
                            .populate('city categoryName preferedCity');

                     res.status(200).json({ users });
              } catch (error) {
                     console.error('Error fetching users:', error);
                     res.status(500).json({ message: 'Error fetching users' });
              }
       },

       // Get the logged-in user
       async getUser(req, res) {
              try {
                     const user = await User.findById(req.user.userId)
                            .select('-password')
                            .populate('city categoryName preferedCity');

                     if (!user) {
                            return res.status(404).json({ message: 'User not found' });
                     }

                     res.status(200).json({ user });
              } catch (error) {
                     console.error('Error fetching user:', error);
                     res.status(500).json({ message: 'Error fetching user' });
              }
       },

       // Forgot password
       async forgotPassword(req, res) {
              try {
                     const { email } = req.body;

                     const user = await User.findOne({ email });
                     if (!user) {
                            return res.status(404).json({ message: 'Email not found' });
                     }

                     const resetToken = jwt.sign(
                            { email: user.email },
                            process.env.SECRET,
                            { expiresIn: '1h' }
                     );

                     const resetLink = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

                     const transporter = nodemailer.createTransport({
                            service: process.env.EMAIL_SERVICE,
                            auth: {
                                   user: process.env.EMAIL_USER,
                                   pass: process.env.EMAIL_PASS,
                            },
                     });

                     await transporter.sendMail({
                            from: process.env.EMAIL_USER,
                            to: email,
                            subject: 'Password Reset',
                            html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
                     });

                     res.status(200).json({ message: 'Password reset link sent' });
              } catch (error) {
                     console.error('Error during password reset:', error);
                     res.status(500).json({ message: 'Error processing password reset' });
              }
       },

       async setAvatar(req, res) {
              try {
                     if (!req.file || !req.file.buffer) {
                            return res.status(400).json({ message: "No file uploaded" });
                     }

                     const { userId } = req.user; // Extract the userId from the token
                     const avatarBuffer = req.file.buffer;

                     // Upload avatar to Cloudinary
                     const result = await new Promise((resolve, reject) => {
                            const stream = cloudinary.uploader.upload_stream(
                                   {
                                          folder: 'avatars',
                                          format: 'jpg',
                                          transformation: [{ width: 300, height: 300, crop: "fill" }],
                                   },
                                   (error, result) => {
                                          if (error) reject(error);
                                          else resolve(result);
                                   }
                            );
                            stream.end(avatarBuffer);
                     });

                     // Update the user's avatar URL in the database
                     const updatedUser = await User.findByIdAndUpdate(
                            userId,
                            { avatar: result.secure_url },
                            { new: true }
                     );

                     if (!updatedUser) {
                            return res.status(404).json({ message: "User not found" });
                     }

                     res.status(200).json({
                            message: "Avatar uploaded successfully",
                            avatarUrl: result.secure_url,
                            user: updatedUser,
                     });
              } catch (error) {
                     console.error("Error uploading avatar:", error);
                     res.status(500).json({ message: "Error uploading avatar" });
              }
       },
};

module.exports = userController;
