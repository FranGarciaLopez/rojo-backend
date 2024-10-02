const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' }, 
  dateOfBirth: { type: Date }, 
  isAdministrator: { type: Boolean }, 
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' } 
});

module.exports = mongoose.model("User", userSchema);




  