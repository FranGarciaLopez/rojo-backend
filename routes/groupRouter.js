const express = require('express');
const groupController = require('../controllers/groupController');

const groupRouter = express.Router();

groupRouter.get('/show', groupController.show);
groupRouter.post('/create', groupController.create);

module.exports = groupRouter;
