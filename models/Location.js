const mongoose = require("mongoose");

const Schema = mongoose.Schema;


const mongoose = require("mongoose");


const LocationSchema = new Schema({
    name: { type: String, required: true },
    address: { type: String}, 
    city: {type: mongoose.Schema.Types.ObjectId, ref: 'City' },
    state:{type:String},
    country:{type:mongoose.Schema.Types.ObjectId, ref:'Country'},
    postalcode:{type:String}

  
  });
  
  module.exports = mongoose.model("Location", LocationSchema);