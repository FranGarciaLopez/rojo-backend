const express = require('express');
const groupController = require('../controllers/groupController');
const groupRouter = express.Router();
const { validateToken } = require('../middlewares/middlewares');


//groupRouter.get('/show', groupController.show);
groupRouter.post('/create', groupController.create);
/* groupRouter.post('/eraseall', groupController.eraseall); */
/* groupRouter.post('/findgroup', groupController.findgroup); */
/* groupRouter.post('/showall', groupController.showall); */
// groupRouter.js
groupRouter.post('/:groupId/message', validateToken, groupController.sendMessage);
groupRouter.get('/:groupId/messages', validateToken, groupController.getMessages);

module.exports = groupRouter;
