const crypto = require('crypto');

const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

const signToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRESIN
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.login = catchAsync(async (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    return next(new AppError(`Please provide your email and password`, 400));
  }

  const user = await User.findOne({ email: req.body.email }).select(
    '+password'
  );

  if (
    !user ||
    !(await user.correctPassword(req.body.password, user.password))
  ) {
    return next(new AppError('Incorrect email or password', 400));
  }

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // Check if token is exist
  if (
    req.headers.authorization ||
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError("You're not logged in. Please log in to get access", 401)
    );
  }

  // Check user is exist
  const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  if (currentUser.passwordChangedAfter(decoded.iat)) {
    return next(
      new AppError(`User recently changed password, Please log in again`, 401)
    );
  }
  // Check jwtTimeStamp is greater than current password changedAt

  // Access user
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(
      new AppError(`You don't have permision to access this route`, 403)
    );
  }
  next();
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError(`There is no user with that email`, 404));
  }

  const resetToken = user.createResetToken();

  const url = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  await user.save({ validateBeforeSave: false });

  const message = `Forgot your password? Go to the link: ${url}\n set new password \n if you did't forgot password then ignore it`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your resetPassword token',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent successfully'
    });
  } catch (err) {
    this.passwordResetToken = undefined;
    this.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There is problem sending email. Please try later', 500)
    );
  }

  // await sendEmail({ to: user.email });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // check user besed token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // check user or token is exist
  if (!user) {
    return next(new AppError('Your token is expired.', 400));
  }
  // set new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'password updated successfully'
  });
});
