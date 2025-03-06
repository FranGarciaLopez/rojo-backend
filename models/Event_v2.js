const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const EventV2Schema = new Schema({
  title: { type: String, required: true },
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
  description: { type: String, required: true },
  administrator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  published: { type: String },
  confirmed: { type: String },
  closed: { type: String },
  dateTime: { type: Date, required: true },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  photos: [{ type: String }] // array photos (url, path...)
}, { collection: 'Events_v2' });
module.exports = mongoose.model("Events_v2", EventV2Schema);