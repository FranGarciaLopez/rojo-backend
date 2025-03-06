const express = require('express');
const { validateToken } = require('../middlewares/middlewares');

const eventManagerController = require('../controllers/eventManagerController');
const eventManagerRouter = express.Router();

//questionnaireRouter.post('/send',        validateToken, questionnaireController.sendData);
eventManagerRouter.get('/getEvents',  validateToken, eventManagerController.getEvents);

module.exports = eventManagerRouter;