const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const GroupSchema = new Schema({

  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' }, 
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'category' },
  dayOfTheWeek: { type: Date, required: true },
  Users: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 

},{ timestamps: true });

module.exports = mongoose.model("Group", GroupSchema);