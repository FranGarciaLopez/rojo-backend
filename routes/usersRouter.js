
const express = require('express');
const userController = require('../controllers/userscontroller');
const { validateToken, isAdmin } = require('../middlewares/middlewares');
const multer = require("multer");
const usersRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

usersRouter.post('/register', userController.userRegister);
usersRouter.post('/login', userController.userLogin);
usersRouter.get('/user', validateToken, userController.getUser);
usersRouter.get('/users', userController.getUsers);
usersRouter.put('/update-preferences', validateToken, userController.updateUserPreferences);
usersRouter.patch('/user', validateToken, userController.patchUser);
usersRouter.put('/forgotpassword', userController.forgotPassword);
usersRouter.post('/upload', validateToken, upload.single('avatar'), userController.setAvatar);
usersRouter.get('/userbyid/:userId',validateToken, userController.getUserById);
usersRouter.post('/subscription', userController.emailSubscribe );
usersRouter.delete('/profile',validateToken, userController.deleteUser );
usersRouter.delete("/user/:userId", validateToken, userController.deleteUserByAdmin);

module.exports = usersRouter;