const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: { type: String, required: true }, 
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }, 
  

});

module.exports = mongoose.model("Category", categorySchema);