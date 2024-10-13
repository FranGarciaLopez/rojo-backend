const express = require('express');
const eventController = require('../controllers/eventscontroller');

const eventsRouter = express.Router();


eventsRouter.post('/eventregister', eventController.eventRegister);
eventsRouter.get('/events', eventController.eventRegister);


module.exports = eventsRouter;