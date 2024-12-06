const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const messageSchema = new Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true }, // Grupo al que pertenece el mensaje
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Usuario que envió el mensaje
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});


module.exports = mongoose.model("Message", messageSchema);



  
