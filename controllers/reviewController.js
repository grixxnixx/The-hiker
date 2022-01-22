const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const handleFactory = require('./factory');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

exports.createReview = handleFactory.createOne(Review);
