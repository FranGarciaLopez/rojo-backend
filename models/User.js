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
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' } ],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'category' },
  dayOfTheWeek: { type: Date, required: true },
  photos: [{ type: String }] ,
},{ timestamps: true });

module.exports = mongoose.model("User", userSchema);