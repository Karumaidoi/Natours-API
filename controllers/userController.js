const catchAsync = require('../utils/catchAsync');
const User = require('../model/userModel');

exports.getUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    success: 'success',
    data: {
      users,
    },
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    success: 'failed',
    message: 'This route is not defined',
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    success: 'failed',
    message: 'This route is not defined',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    success: 'failed',
    message: 'This route is not defined',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    success: 'failed',
    message: 'This route is not defined',
  });
};
