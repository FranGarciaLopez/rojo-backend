
const express = require('express');
const { userRegister, userLogin } = require('../controllers/usersController');

const usersRouter = express.Router();

usersRouter.post('/register', userRegister);
usersRouter.post('/login', userLogin);

module.exports = usersRouter;
