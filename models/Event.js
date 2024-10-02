
const mongoose = require("mongoose");


const EventSchema = new Schema({
    title: { type: String, required: true },
    city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' }, 
    description: { type: String, required: true },
    administrator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    dateTime: { type: Date, required: true }, 
    location: { type: mongoose.Schema.Types.ObjectId, ref:'Location'},
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, 
    photos: [{ type: String }] 
  });
  
  module.exports = mongoose.model("Event", EventSchema);



