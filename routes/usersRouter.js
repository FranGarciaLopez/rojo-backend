
const express = require('express');
const { userRegister, userLogin } = require('../controller/usersController');

const usersRouter = express.Router();

usersRouter.post('/register', userRegister);
usersRouter.post('/login', userLogin);
usersRouter.post('/user', getUser);

module.exports = usersRouter;
