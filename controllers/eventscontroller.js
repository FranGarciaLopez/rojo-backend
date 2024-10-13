
const Event = require('../models/Event');
const City = require('../models/City');
const Category = require('../models/Category');
const Location = require('../models/Location');

const jwt = require('jsonwebtoken');

const eventController = {
    async eventRegister(req, res) {
        try {
            const { title, city, description, administrator, dateTime, location, category, photos } = req.body;

           
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
                location: locationDocument._id,
                category: categoryDocument._id,
                photos: photos || [],
                createdAt: new Date().toISOString(),
                modifiedAt: new Date().toISOString(),
                deletedAt: null,
            });

            const savedEvent = await newEvent.save();
            res.status(201).json(savedEvent);
        } catch (error) {
            res.status(500).json({ message: 'Error creating event', error });
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
};

module.exports=eventController;
