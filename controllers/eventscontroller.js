
const Event = require('../models/Event');
const User = require('../models/User');
const jwt = require('jsonwebtoken');



const eventController ={


    async eventRegister(req, res){

        try{

            const {title, city, description, administrator, dateTime, location, category, photos}= req.body;

            const newEvent = new Event(
             {
                 title,
                 city,
                 description,
                 administrator,
                 dateTime,
                 location,
                 category,
                 photos


             }
            );
     
            const savedEvent = await newEvent.save();
            res.status(201).json(savedEvent);
        }catch(Error){
            res.status(500).json({ message: 'Error creating event', error });
        }
    
    },

    asyn event


}

module.exports=eventController;
