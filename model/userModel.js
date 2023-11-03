/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable new-cap */
const crypto = require('crypto');
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
  passwordChangedAt: Date,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
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

userSchema.methods.changedPassword = async function (JWTTimeStamp) {
  console.log(this.passwordChangedAt);
  if (this.passwordChangedAt) {
    const timeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return JWTTimeStamp < timeStamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = new mongoose.model('User', userSchema);

module.exports = User;
