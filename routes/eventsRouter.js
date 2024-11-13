const express = require('express');
const {eventController} = require('../controllers/eventscontroller');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const middlewares = require('../middlewares/middlewares');


const eventsRouter = express.Router();



eventsRouter.post('/eventregister', eventController.eventRegister);
eventsRouter.get('/events', eventController.getEvents);


module.exports = eventsRouter;