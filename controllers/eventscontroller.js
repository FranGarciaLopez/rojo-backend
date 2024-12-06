
const Event = require('../models/Event');
const City = require('../models/City');
const Category = require('../models/Category');
const Location = require('../models/Location');
const User = require('../models/User');
const multer = require("multer");


const jwt = require('jsonwebtoken');
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();


const eventController = {
    async eventRegister(req, res) {
        try {
            const { title, city, description, administrator, dateTime, location, category, photos } = req.body;

            if (!Array.isArray(photos)) {
                return res.status(400).json({ message: 'photoUrls must be an array of URLs' });
            }

            let cityDocument = await City.findOne({ name: city });
            if (!cityDocument) {
                cityDocument = new City({ name: city });
                await cityDocument.save();
            }

            const parsedDateTime = new Date(dateTime);
            if (isNaN(parsedDateTime.getTime())) {
                return res.status(400).json({ message: 'Invalid dateTime format' });
            }


            const categoryDocument = await Category.findById(category);
            if (!categoryDocument) {
                return res.status(400).json({ message: 'Invalid category ID' });
            }


            let locationDocument = await Location.findOne({ name: location });
            if (!locationDocument) {
                locationDocument = new Location({ name: location });
                await locationDocument.save();
            }



            const newEvent = new Event({
                title,
                city: cityDocument._id,
                description,
                administrator,
                dateTime: parsedDateTime,
                location: null,
                category: categoryDocument._id,
                photos,
                createdAt: new Date().toISOString(),
                modifiedAt: new Date().toISOString(),
                deletedAt: null,
            });

            const savedEvent = await newEvent.save();
            res.status(201).json(savedEvent);
        } catch (error) {
            res.status(500).json({
                message: 'Error creating event',
                error: error.message
            });
        }
    },




    async getEvents(req, res) {
        try {
            const events = await Event.find().populate('city').populate('administrator').populate('location').populate('category');
            res.status(200).json(events);
            
        } catch (error) {
            console.error('Error getting events:', error);
            res.status(500).json({ message: 'Error getting events', error });
        }
    },

    async getEvent(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'Event ID is required' });
            }
            const event = await Event.findById(id)
                .populate('city')
                .populate('administrator')
                .populate('location')
                .populate('category');
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }
            res.status(200).json(event);
        } catch (error) {
            res.status(500).json({ message: 'Error getting event', error });
        }
    }
};

module.exports = eventController;
