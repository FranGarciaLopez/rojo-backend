const blogController = require('../controllers/blogController');
const express = require('express');
const blogsRouter = express.Router();
const middlewares = require('../middlewares/middlewares');



blogsRouter.post('/', blogController.blogRegister );
blogsRouter.get('/blogs', blogController.getBlogs);
blogsRouter.get('/:id',  middlewares.validateToken, blogController.getBlog);


module.exports = blogsRouter;