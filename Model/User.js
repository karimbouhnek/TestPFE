const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Création Schema
const UserSchema = new Schema({
  fname:{
    type: String,
    required: true
  },
  lname:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true
  },
  password:{
    type: String,
    required: true
  }
});

mongoose.model('users', UserSchema);