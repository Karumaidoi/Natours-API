const express = require('express');

const tourContoller = require('../controllers/tourController');

const router = express.Router();

router.param('id', tourContoller.checkID);

router
  .route('/')
  .get(tourContoller.getTours)
  .post(tourContoller.checkTour, tourContoller.createTour);

router
  .route('/:id')
  .get(tourContoller.getTour)
  .patch(tourContoller.updateTour)
  .delete(tourContoller.deleteTour);

module.exports = router;
