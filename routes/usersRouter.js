
const express = require('express');
const { userRegister, userLogin, getAllUsers } = require('../controllers/usersController');
const middlewares = require('../middlewares');

const usersRouter = express.Router();

usersRouter.post('/register', userRegister);
usersRouter.post('/login',middlewares.validateToken, userLogin);
usersRouter.get('/', getAllUsers);

module.exports = usersRouter;
