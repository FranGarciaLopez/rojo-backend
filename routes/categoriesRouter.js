const express = require('express');
const categoriesController = require('../controllers/categoriesController');


const categoriesRouter = express.Router();


categoriesRouter.get('/categories', categoriesController.getCategories);


module.exports = categoriesRouter;