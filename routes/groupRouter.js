const express = require('express');
const groupController = require('../controllers/groupController');

const groupRouter = express.Router();

//groupRouter.get('/show', groupController.show);
groupRouter.post('/create', groupController.create);
groupRouter.post('/eraseall', groupController.eraseall);
groupRouter.post('/findgroup', groupController.findgroup);
groupRouter.post('/showall', groupController.showall);

module.exports = groupRouter;
