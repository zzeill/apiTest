const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: 'Name is required.' },
  lastName: { 
    type: String, 
    required: 'Last name is required.' },
  email: { 
    type: String, unique: true, 
    required: 'Email is required.' },
  password: { 
    type: String, 
    required: 'Password is required.' },
  type: {
    type: [{
      type: String,
      enum: ['user', 'admin']
    }],
    default: ['user']
  },
  profilePhoto : {
    type : String,
    default: null}
});

module.exports = mongoose.model("user", userSchema);