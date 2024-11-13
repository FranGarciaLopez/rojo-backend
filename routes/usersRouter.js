
const express = require('express');
const userController = require('../controllers/userscontroller');
const { validateToken } = require('../middlewares/middlewares');

const usersRouter = express.Router();

usersRouter.post('/register', userController.userRegister);
usersRouter.post('/login', userController.userLogin);
usersRouter.get('/user', validateToken, userController.getUser);

module.exports = usersRouter;