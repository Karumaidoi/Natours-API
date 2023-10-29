const express = require('express');

const tourContoller = require('../controllers/tourController');

const authController = require('../controllers/authController');

const router = express.Router();

router.route('/tour-stats').get(tourContoller.getTourStats);
router.route('/monthly-plan/:year').get(tourContoller.gegtMonthltyPlan);

router
  .route('/top-5-tours')
  .get(tourContoller.aliasTopTours, tourContoller.getTours);

router
  .route('/')
  .get(authController.protect, tourContoller.getTours)
  .post(tourContoller.createTour);

router
  .route('/:id')
  .get(tourContoller.getTour)
  .patch(tourContoller.updateTour)
  .delete(tourContoller.deleteTour);

module.exports = router;
