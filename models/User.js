const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstname:{type:String, required:true},
  lastname:{type:String, required:true},
  email: { type: String, required: true },
  password: { type: String, required: true },
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' }, 
  dateOfBirth: { type: Date }, 
  isAdministrator: { type: Boolean,default: false }, 
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' } ]

  /*I changed the field by creating a relationship of user and events. 
  This relationship is one to many, 
  which created an array of events in the field to be able to filter for each user.*/
},{ timestamps: true });

module.exports = mongoose.model("User", userSchema);




  