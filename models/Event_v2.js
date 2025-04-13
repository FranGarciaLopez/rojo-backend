const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const EventV2Schema = new Schema({
  title: { type: String, required: true },
  city: { type: String },//{ type: mongoose.Schema.Types.ObjectId, ref: 'City' },
  description: { type: String, required: true },
  administrator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  published: { type: String },
  confirmed: { type: String },
  budget: { type: String },
  dateAndTime: { type: String },
  closed: { type: String },
  dateTime: { type: Date},
  location: { type: String },// { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  location_str: { type: String },
  category: { type: String},//{ type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  photos: [{ type: String }] // array photos (url, path...)
}, { collection: 'Events_v2' });
module.exports = mongoose.model("Events_v2", EventV2Schema);