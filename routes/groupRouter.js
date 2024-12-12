const express = require('express');
const groupController = require('../controllers/groupController');
const groupRouter = express.Router();
const { validateToken } = require('../middlewares/middlewares');

// Routes for group operations
groupRouter.post('/create', groupController.create);
/* groupRouter.post('/eraseall', groupController.eraseAll); */
/* groupRouter.post('/findgroup', groupController.findGroup); */
/* groupRouter.get('/showall', groupController.showAll); */
/* groupRouter.post('/adduser-group', validateToken, groupController.addUserToGroup);
groupRouter.get('/findgroupbyid/:id', groupController.findGroupById); */

groupRouter.post('/:groupId/message', validateToken, groupController.sendMessage);
groupRouter.get('/:groupId/messages', validateToken, groupController.getMessages);

module.exports = groupRouter;
