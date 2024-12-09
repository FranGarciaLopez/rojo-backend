const express = require('express');
const groupController = require('../controllers/groupController');
const { validateToken } = require('../middlewares/middlewares');
const groupRouter = express.Router();

//groupRouter.get('/show', groupController.show);
groupRouter.post('/create', groupController.create);
groupRouter.post('/eraseall', groupController.eraseall);
groupRouter.post('/findgroup', groupController.findgroup);
groupRouter.get('/showall', groupController.showall);
groupRouter.post('/adduser-group', validateToken, groupController.addUserToGroup);
groupRouter.get('/findgroupbyid/:id', groupController.findGroupbyid);



module.exports = groupRouter;
