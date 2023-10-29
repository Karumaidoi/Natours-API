/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable new-cap */
const mongoose = require('mongoose');
const validator = require('validator');
const bycrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Provide your name'],
    trim: true,
  },

  email: {
    type: String,
    required: [true, 'Please provide your email address'],
    trim: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'This field is required'],
    trim: true,
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'This field is required'],
    trim: true,
    validate: {
      // This only works on save
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords does not match',
    },
  },
});

userSchema.pre('save', async function (next) {
  // Check if there is password - If password was actually modified
  if (!this.isModified('password')) return next();

  //Encrypt the password - hashing with cost of 28
  this.password = await bycrypt.hash(this.password, 12);

  // Remove its persistence to the DB - Deleting the password confirm field
  this.passwordConfirm = undefined;

  next();
});

// Checking if passwords are the same
userSchema.methods.correctPassword = async function (
  candidatePassword,
  usersPassword,
) {
  return await bycrypt.compare(candidatePassword, usersPassword);
};

const User = new mongoose.model('User', userSchema);

module.exports = User;
