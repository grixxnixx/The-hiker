const express = require('express');

const tourController = require('../controllers/tourController');

const router = express.Router();

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

// router.route('/:tourId').get(tourController.getTour);
router.route('/:slug').get(tourController.getTourByName);
module.exports = router;
