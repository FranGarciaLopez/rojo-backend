const express = require('express');
const { validateToken } = require('../middlewares/middlewares');

const eventManagerController = require('../controllers/eventManagerController');
const eventManagerRouter = express.Router();

//questionnaireRouter.post('/send',        validateToken, questionnaireController.sendData);
eventManagerRouter.get('/getEvents',        validateToken, eventManagerController.getEvents);
eventManagerRouter.get('/getSingleEvent',   validateToken, eventManagerController.getSingleEvent);
eventManagerRouter.post('/newEvent',        validateToken, eventManagerController.newEvent);
eventManagerRouter.put('/updateEvent',      validateToken, eventManagerController.updateEvent);
eventManagerRouter.delete('/deleteEvent',   validateToken, eventManagerController.deleteEvent);

module.exports = eventManagerRouter;