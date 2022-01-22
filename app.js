const path = require('path');
const morgan = require('morgan');
const express = require('express');
const cors = require('cors');

const errorHandler = require('./controllers/errorHandler');
const AppError = require('./utils/appError');

const tourRoutes = require('./routes/tourRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

//Body parser
app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

// Test middlewares
app.use((req, res, next) => {
  req.requestAt = new Date().toISOString();

  next();
});

app.get('/', (req, res, next) => {
  res.redirect('/overview.html');
});
// Routers
app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/reviews', reviewRoutes);

app.use('*', (req, res, next) => {
  next(new AppError(`There is no route ${req.baseUrl} on this server`, 404));
});

app.use(errorHandler);

module.exports = app;
