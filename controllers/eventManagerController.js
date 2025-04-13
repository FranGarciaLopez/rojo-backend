const Event = require('../models/Event_v2');
const City = require('../models/City');
const Category = require('../models/Category');
const User = require('../models/User');
const Location = require('../models/Location');

const mongoose = require('mongoose');

const eventManagerController = {

    /*** getEvents *****************************************************
     * answer back with all the events organized from the event manager with the id specified in the field.
     * it require also other 3 fields.
     * the event manager can settle those fields in the dashboard, section ACTIONS.
     *  - published: can be true or false
     *  - confirmed: can be true or false
     *  - closed: can be true or false
     * 
     * GET: http://localhost:3000/eventManager/getEvents/
     * 
     * { 
            "idEventManager" : "677bd2e57d0c42a398e374f2",
            "published"      : "true",
            "confirmed"      : "true",
            "closed"         : "true"
        }
     *******************************************************************/
    async getEvents (req, res) {
        try {
            const { idEventManager } = req.body;
            const { published } = req.body;
            const { confirmed } = req.body;
            const { closed } = req.body;
            if (!idEventManager) {  return res.status(400).json({ message: 'User ID is required' });   }
            if (!published) {  return res.status(400).json({ message: 'field published is required' });   }
            if (!confirmed) {  return res.status(400).json({ message: 'field confirmed is required' });   }
            if (!closed) {  return res.status(400).json({ message: 'field closed is required' });   }
        // Validate ObjectId
            if (!mongoose.isValidObjectId(idEventManager)) {
                return res.status(400).json({ message: "Invalid Event Manager ID" });
            }

            const eventmanagerObjectId = new mongoose.Types.ObjectId(idEventManager);        
            console.log(req.body)   
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
    },
        /*** getSingleEvent *****************************************************
     * answer back with all the information available on the DB of the event.
     * it require the idEvent.
     * 
     * GET: http://localhost:3000/eventManager/getSingleEvent/
     * 
     * { 
            "idEvent" : "67d128d89591d0fbf710f057"
        }
     *******************************************************************/
    async getSingleEvent(req, res) {
        try {
            const { idEvent } = req.body;
    
            // Validate required field
            if (!idEvent) {
                return res.status(400).json({ message: "Event ID is required" });
            }
    
            // Validate ObjectId format
            if (!mongoose.isValidObjectId(idEvent)) {
                return res.status(400).json({ message: "Invalid Event ID format" });
            }
    
            // Find the event
            const event = await Event.findById(idEvent);
    
            if (!event) {
                return res.status(404).json({ message: "Event not found" });
            }
    
            res.status(200).json(event);
        } catch (error) {
            console.error("Error fetching event:", error);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    },
    /*** newEvent ********************************************
     * route to insert a a new event into the database.
     * the event manager will use it in the NEW EVENT page.
     * 
     * the required fields are:
     *          title, description, idEventManager 
     *                   if (!eventData.title || !eventData.description || !eventData.idEventManager) {
     * 
     * the fiedls accepted are:
     *          const allowedFields = ["title", "category", 
     *              "city", "budget", "dateAndTime", 
     *              "description", "location", "idEventManager", 
     *              "published", "confirmed", "closed", 
     *              "dateTime", "location_str", "photos"]
     * 
     * if inserted, dateAndTime must be in a Date format:
     *                      eventData.dateTime = new Date(eventData.dateTime);
     *                          if (isNaN(eventData.dateTime.getTime())) {
     * 
     * it returns:
     *          - 'Missing required fields' : if any of the required fields is not present
     *          - 'Invalid date format for dateTime' : if the dateAndTime field is not in the proper format
     *          - 'Done' + the uploaded data + id event:  if the new event is successfully uploaded
     *          - 'Server error' : if any problem
     * 
     * POST: http://localhost:3000/eventManager/newEvent/
     * { 
            "idEvent" : "67cc8017f0bacdb366c15f5c",
            "idEventManager" : "677bd2e57d0c42a398e374f2",
            "description" : "New description to test newEvent",
            "budget": "1000",
            "city" : "C1",
            "title" : "another new title test"
        }
     *******************************************************************/
    async newEvent (req, res) {
        try {
        // Extract only the fields that are provided in the request
        const eventData = {};
        const allowedFields = ["title", "category", "city", "budget", "dateAndTime", "description", "location", "idEventManager", "published", "confirmed", "closed", "dateTime", "location_str", "photos"];
        let eventmanagerObjectId = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                eventData[field] = req.body[field];
            }
        });
        // Ensure required fields are present
        if (!eventData.title || !eventData.description || !eventData.idEventManager) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        // Convert dateTime to Date object if provided
        if (eventData.dateTime) {
            eventData.dateTime = new Date(eventData.dateTime);
            if (isNaN(eventData.dateTime.getTime())) {
                return res.status(400).json({ message: 'Invalid date format for dateTime' });
            }
        }
        if (eventData.idEventManager) {
            eventData.administrator = new mongoose.Types.ObjectId(eventData.idEventManager); 
        }
        // Save event to MongoDB
        const newEvent = new Event(eventData);
        await newEvent.save();
        console.log('New Event Saved:', newEvent);
        res.json({ message: 'Done', newEvent ,
            eventId: newEvent._id
         });
        } catch (error) {
            console.error('Error updating the new event:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
    /*** updateEvent ********************************************
     * will be used by the event manager in the EVENT PAGE,
     *  
     * it require the idEvent field.
     * 
     * the fiedls accepted are:
     *          const allowedFields = ["title", "category", 
     *              "city", "budget", "dateAndTime", 
     *              "description", "location", "idEventManager", 
     *              "published", "confirmed", "closed", 
     *              "dateTime", "location_str", "photos"]
     * 
     * if inserted, dateAndTime must be in a Date format:
     *                      eventData.dateTime = new Date(eventData.dateTime);
     *                          if (isNaN(eventData.dateTime.getTime())) {
     * 
     * it returns:
     *          - 'Event ID is required' : if idEvent field is not present
     *          - 'Invalid date format for dateTime' : if the dateAndTime field is not in the proper format
     *          - 'Event not found' : if the event is not available in mongoDB
     *          - 'Event updated successfully' : if the operation succed
     *          - 'Error updating event:' : if any other problems
     * 
     * PUT: http://localhost:3000/eventManager/updateEvent/
     * { 
            "idEvent" : "67cc8017f0bacdb366c15f5c",
            "description" : "New description to test update event",
            "budget": "1000000",
        }     * 
    ***********************************************************/
    async updateEvent(req,res) {
        try {
            const { idEvent } = req.body;
            if (!idEvent) {
                return res.status(400).json({ message: 'Event ID is required' });
            }    
            // Extract only the fields that are provided in the request
            const eventData = {};
            const allowedFields = ["title", "category", "city", "budget", "dateAndTime", "description", "location", "administrator", "published", "confirmed", "closed", "dateTime", "location_str", "photos"];
            allowedFields.forEach(field => {
                if (req.body[field] !== undefined) {
                    eventData[field] = req.body[field];
                }
            });
            // Convert dateTime to Date object if provided
            if (eventData.dateTime) {
                eventData.dateTime = new Date(eventData.dateTime);
                if (isNaN(eventData.dateTime.getTime())) {
                    return res.status(400).json({ message: 'Invalid date format for dateTime' });
                }
            }
            // Update event in MongoDB
            const updatedEvent = await Event.findByIdAndUpdate(idEvent, eventData, { new: true });
            if (!updatedEvent) {
                return res.status(404).json({ message: 'Event not found' });
            }
            console.log('Event Updated:', updatedEvent);
            res.json({ message: 'Event updated successfully', event: updatedEvent });
        } catch (error) {
            console.error('Error updating event:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },
        /*** deleteEvent ********************************************
     * reserved for admin uses.
     *  
     * it require the idEvent field.
     * 
     * it returns:
     *          - 'Event ID is required' : if idEvent field is not present
     *          - 'Event not found' : if the event is not available in mongoDB
     *          - 'Event deleted successfully' : if the operation succed
     *          - 'Internal Server Error' : if any other problems
     * 
     * DELETE: http://localhost:3000/eventManager/deleteEvent/
     * { 
            "idEvent" : "67cc8017f0bacdb366c15f5c"
        }    
    ***********************************************************/
    async deleteEvent(req, res) {
        try {
            const { idEvent } = req.body;
            if (!idEvent) {
                return res.status(400).json({ message: 'Event ID is required' });
            }
            const deletedEvent = await Event.findByIdAndDelete(idEvent);
            if (!deletedEvent) {
                return res.status(404).json({ message: 'Event not found' });
            }
            console.log('Event Deleted:', deletedEvent);
            res.json({ message: 'Event deleted successfully', event: deletedEvent });
        } catch (error) {
            console.error('Error deleting event:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    
}
module.exports = eventManagerController;