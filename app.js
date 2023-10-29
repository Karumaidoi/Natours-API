const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');

const globalErrorHandler = require('./controllers/errorController');
const tourRoute = require('./routes/tourRoutes');
const userRoute = require('./routes/userRoutes');

const app = express();

app.use(express.json());

app.use(express.static(`${__dirname}/public`));

app.use(morgan('dev'));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ROUTES FOR TOURS
app.use('/api/v1/tours', tourRoute);
app.use('/api/v1/users', userRoute);

// Undefined Route
app.use('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} in this server`, 404));
});

// Handling errors Middleware
app.use(globalErrorHandler.createError);

module.exports = app;
