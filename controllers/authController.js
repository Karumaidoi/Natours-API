/* eslint-disable import/no-extraneous-dependencies */
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

// Function for generating the token
const signInToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signUp = catchAsync(async (req, res, next) => {
  //1). Creating the new User
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // Creating JWT Token
  const token = signInToken(newUser._id);

  // Sending Token to the user
  res.status(201).json({
    status: 'success',
    token: token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if there is email or password
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2) Check if email and passwords are  correct
  const user = await User.findOne({ email: email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything is ok, send to the client
  const token = signInToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

// Authorization Middleware
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  //1) Getting the token and checking if it is there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ').at(1);
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to access', 401),
    );
  }
  //2) Verification of the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3) Check if the user still exist
  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new AppError('The user does not exist', 401));
  }

  //4) Check if the user has changed the password after the JWT was issued

  if (await user.changedPassword(decoded.iat)) {
    return next(
      new AppError(
        'User recently changed their password, Please log in again',
        401,
      ),
    );
  }

  //
  req.user = user;

  next();
});

// Restrict Middleware
exports.restrictTo = (...roles) =>
  catchAsync(async (req, res, next) => {
    // Roles is an array eg Admin & Lead Guide

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }

    next();
  });

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) Get user by email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  //2) Generate a random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3) send it to the user's email
  const resetUrl = `${req.protocol}://${req.get(
    'host',
  )}/api/users/resetPassword/${resetToken}`;

  const message = `Forgot your password. Submit a patch request with your new password and a password confirm to ${resetUrl}.\n If you didn't forget your password, please ignore this message.`;

  try {
    await sendEmail({
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (error) {
    console.log(error);
    user.createPasswordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Error sending an email. Try again later', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {});
