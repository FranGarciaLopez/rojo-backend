const express = require('express');
const { validateToken } = require('../middlewares/middlewares');

const questionnaireController = require('../controllers/questionnaireController');
const questionnaireRouter = express.Router();

questionnaireRouter.post('/send',        validateToken, questionnaireController.sendData);
questionnaireRouter.get('/get/:id',      validateToken, questionnaireController.getData);
questionnaireRouter.get('/getAll',       validateToken, questionnaireController.getAll);
questionnaireRouter.get('/getQuestions', validateToken, questionnaireController.getQuestions);
questionnaireRouter.get('/getAnswer',    validateToken, questionnaireController.getAnswer);

module.exports = questionnaireRouter;