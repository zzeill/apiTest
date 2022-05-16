const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  id: {
    type: String,
    required: 'Id is required.'
  },
  serie: {
    type: String,
    required: 'Id is required.'
  },
  idChar: {
    type: Number,
    required: 'Id is required.'
  },
});

module.exports = mongoose.model("favorites", blogSchema);