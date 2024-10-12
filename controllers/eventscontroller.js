
const Event = require('../models/Event');

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
                 photos: photos || [],
                 createdAt: new Date().toISOString(), 
                 modifiedAt: new Date().toISOString(),
                 deletedAt: null,


             }
            );
     
            const savedEvent = await newEvent.save();
            res.status(201).json(savedEvent);
        }catch(Error){
            res.status(500).json({ message: 'Error creating event', error });
        }
    
    },

 


}

module.exports=eventController;
