const express = require('express');

const tourContoller = require('../controllers/tourController');

const router = express.Router();

router
  .route('/top-5-tours')
  .get(tourContoller.aliasTopTours, tourContoller.getTours);

router.route('/').get(tourContoller.getTours).post(tourContoller.createTour);

router
  .route('/:id')
  .get(tourContoller.getTour)
  .patch(tourContoller.updateTour)
  .delete(tourContoller.deleteTour);

module.exports = router;
