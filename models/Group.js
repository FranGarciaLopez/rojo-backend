const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const GroupSchema = new Schema({

  Users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // Array of user references
  interestedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }], 
   messages:[{type:mongoose.Schema.Types.ObjectId, ref: 'Message'}]// Array of event references
}, { timestamps: true });

module.exports = mongoose.model("Group", GroupSchema);