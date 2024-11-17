
const express = require('express');
const userController = require('../controllers/userscontroller');
const { validateToken } = require('../middlewares/middlewares');
const multer = require("multer");
const usersRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

usersRouter.post('/register', userController.userRegister);
usersRouter.post('/login', userController.userLogin);
usersRouter.get('/user', validateToken, userController.getUser);
usersRouter.get('/users', userController.getUsers);
usersRouter.put('/update-preferences', validateToken, userController.updateUserPreferences);
usersRouter.post('/upload',upload.single('avatar'), userController.setavatar);


module.exports = usersRouter;