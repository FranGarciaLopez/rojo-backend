const mongoose = require('mongoose');
const QueestionnaireSchema = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    TextQuestions: { type: String, required: false }, // stored locally in ./scripts/questionnaireOBJ.js
    TextAnswers: { type: String, required: false },   // stored locally in ./scripts/questionnaireOBJ.js
    A_str: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Questionnaire', QueestionnaireSchema);