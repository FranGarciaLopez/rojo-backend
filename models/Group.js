const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const GroupSchema = new Schema({
  Users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  interestedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Group", GroupSchema);