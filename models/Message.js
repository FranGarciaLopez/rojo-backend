const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Ensure ObjectId
    content: { type: String, required: true }, // Content is mandatory
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', MessageSchema);
