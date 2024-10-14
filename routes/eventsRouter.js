const express = require('express');
const eventController = require('../controllers/eventscontroller');
const middlewares = require('../middlewares/middlewares');

const eventsRouter = express.Router();


eventsRouter.post('/eventregister', middlewares.formattedText, eventController.eventRegister);
eventsRouter.get('/events', eventController.getEvents);


module.exports = eventsRouter;