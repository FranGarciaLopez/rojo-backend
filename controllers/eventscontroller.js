
const Event = require('../models/Event');
const City = require('../models/City');
const Category = require('../models/Category');
const User = require('../models/User');
const Location = require('../models/Location');
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
            const {
                title,
                city,
                description,
                administrator, // This should match the `_id` of the user creating the event
                dateTime,
                location,
                category,
                photos,
            } = req.body;

            // Validate photos array
            if (!Array.isArray(photos)) {
                return res.status(400).json({ message: "Photos must be an array of URLs" });
            }

            // Validate or create city
            let cityDocument = await City.findOne({ name: city });
            if (!cityDocument) {
                cityDocument = new City({ name: city });
                await cityDocument.save();
            }

            // Validate dateTime
            const parsedDateTime = new Date(dateTime);
            if (isNaN(parsedDateTime.getTime())) {
                return res.status(400).json({ message: "Invalid dateTime format" });
            }

            // Validate category
            const categoryDocument = await Category.findById(category);
            if (!categoryDocument) {
                return res.status(400).json({ message: "Invalid category ID" });
            }

            // Validate or create location
            let locationDocument = await Location.findOne({ name: location });
            if (!locationDocument) {
                locationDocument = new Location({ name: location });
                await locationDocument.save();
            }

            // Create new event
            const newEvent = new Event({
                title,
                city: cityDocument._id,
                description,
                administrator,
                dateTime: parsedDateTime,
                location: locationDocument._id,
                category: categoryDocument._id,
                photos,
                createdAt: new Date().toISOString(),
                modifiedAt: new Date().toISOString(),
                deletedAt: null,
            });

            const savedEvent = await newEvent.save();

            // Increment organizedEvents for the administrator
            const updatedUser = await User.findByIdAndUpdate(
                administrator,
                { $inc: { organizedEvents: 1 } }, // Increment organizedEvents by 1
                { new: true } // Return the updated user document
            );

            // Check if user was successfully updated
            if (!updatedUser) {
                return res.status(404).json({ message: "Administrator user not found" });
            }

            res.status(201).json({
                message: "Event created successfully",
                event: savedEvent,
                updatedUser: {
                    organizedEvents: updatedUser.organizedEvents, // Include updated count in the response
                },
            });
        } catch (error) {
            console.error("Error creating event:", error);
            res.status(500).json({
                message: "Error creating event",
                error: error.message,
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
    },
    async signUpForEvent(req, res) {

        try {
            const userId = req.user.userId; // Extracted from the token

            const eventIdDocument = await Event.findById(req.body.eventId);
            if (!eventIdDocument) {
                return res.status(404).json({ message: 'Event not found.' });
            }

            if (!userId || !eventIdDocument) {
                return res.status(400).json({ message: 'User ID and event ID are required.' });
            }

            const updatedUser = await User.findByIdAndUpdate(
                userId,
                {
                    $addToSet: { interestedEvents: eventIdDocument._id }
                },
                { new: true }
            );


            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found.' });
            }

            res.status(200).json({ message: 'Inscripción exitosa al evento.', user: updatedUser });
        } catch (error) {
            console.error('Error al inscribirse al evento:', error);
            res.status(500).json({ error: 'Error al inscribirse al evento.' });
        }
    },

    async EditEvent(req, res) {
        const { eventId } = req.params;
        const { title, city, description, administrator, dateTime, location, category, photos } = req.body;

        try {
            const event = await Event.findOne({ _id: eventId });

            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            if (event.photos && event.photos.length > 0) {
                for (let i = 0; i < event.photos.length; i++) {
                    const photoUrl = event.photos[i];
                    const publicId = photoUrl.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                }
            }


            let uploadedPhotos = [];
            if (photos && photos.length > 0) {
                for (let i = 0; i < photos.length; i++) {
                    const result = await cloudinary.uploader.upload(photos[i], {
                        folder: 'event_photos',
                    });
                    uploadedPhotos.push(result.secure_url);
                }
            }


            if (title) event.title = title;
            if (city) event.city = city;
            if (description) event.description = description;
            if (administrator) event.administrator = administrator;
            if (dateTime) event.dateTime = dateTime;
            if (location) event.location = location;
            if (category) event.category = category;
            if (uploadedPhotos.length > 0) event.photos = uploadedPhotos;


            const updatedEvent = await event.save();

            return res.status(200).json(updatedEvent);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async deleteEvent(req, res) {
        const eventId = req.params.eventId;

        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ message: "Event not found" })
        }


        await Event.findByIdAndDelete(eventId);

        return res.status(200).json({ message: 'Event deleted successfully' });
    }



};

module.exports = eventController;
