const mongoose = require('mongoose');
const Category = require('../models/Category'); 


async function seedCategories() {
    const categories = [
        { name: 'Concerts' },
        { name: 'Conferences' },
        { name: 'Workshops' },
        { name: 'Seminar' },
        { name: 'Fairs' },
        { name: 'Theater' },
        { name: 'Cinema' },
        { name: 'Art and Culture' },
        { name: 'Food Events' },
        { name: 'Children Events' },
        { name: 'Outdoor Activities' },
        { name: 'Networking' },
        { name: 'Virtual Events' },

    ];

    try {
        await Category.insertMany(categories);
        console.log('Categories created successfully');
    } catch (error) {
        console.error('Error creating categories', error);
    } finally {
        mongoose.connection.close(); 
    }
};

module.exports = { seedCategories };