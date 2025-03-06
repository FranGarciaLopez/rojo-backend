const Event = require('../models/Event_v2');
const City = require('../models/City');
const Category = require('../models/Category');
const User = require('../models/User');
const Location = require('../models/Location');

const mongoose = require('mongoose');

const eventManagerController = {

    /*** getPublishedEvents ********************************************
     * GET: http://localhost:3000/eventManager/getEvents/
     * { 
            "id" : "677bd2e57d0c42a398e374f2",
            "published"     : "true",
            "confirmed"     : "true",
            "closed"     : "true"
        }
     *******************************************************************/
    async getEvents (req, res) {
        try {
            const { id } = req.body;
            const { published } = req.body;
            const { confirmed } = req.body;
            const { closed } = req.body;
            if (!id) {  return res.status(400).json({ message: 'User ID is required' });   }
            if (!published) {  return res.status(400).json({ message: 'field published is required' });   }
            if (!confirmed) {  return res.status(400).json({ message: 'field confirmed is required' });   }
            if (!closed) {  return res.status(400).json({ message: 'field closed is required' });   }
            const eventmanagerObjectId = new mongoose.Types.ObjectId(id);            
                const EventsOfId = await Event.find({ 
                    administrator: eventmanagerObjectId,
                    published: published,
                    confirmed: confirmed,
                    closed: closed 
                    });
                if (EventsOfId.length === 0) {
                    return res.status(404).json({ message: 'No Events found for this Event manager' });
                }
            res.status(200).json(EventsOfId);
        } catch (error) {
            console.error('Error updating A_str:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
}
module.exports = eventManagerController;