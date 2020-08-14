const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const AppError = require('./utils/appError');
const userRouter = require('./routes/userRoutes');
const spotifyRouter = require('./routes/spotifyRoutes');

// Start express app
const app = express();

app.enable('trust proxy');

// GLOBAL MIDDLEWARE

// Set security HTTP headers
app.use('/api', helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from the same IP
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour.',
});

app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(
  express.json({
    limit: '10kb',
  })
);
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
    allowedHeaders: [
      'Accept',
      'Content-Type',
      'Content-Length',
      'application/json',
      'Authorization',
      'Set-Cookie',
      'X-Requested-With',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
    ],
    methods: ['OPTIONS', 'GET', 'PATCH', 'POST', 'DELETE'],
    preflightContinue: true,
    optionsSuccessStatus: 200,
  })
);

// Send 200 OK Status if the request is of the OPTIONS (pre-flight) HTTP method
app.options('/*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With'
  );
  res.sendStatus(200);
});

// Access-Control-Allow-Origin: * (everywhere)
// app.options(cors());

app.use(bodyParser.json());

// Data sanitization to prevent NoSQL query injection
app.use(mongoSanitize());

// Data sanitization to prevent XSS (cross-site scripting) attacks
app.use(xss());

app.use(hpp()); // ADD WHITELIST ARRAY LATER

// ROUTES
app.use('/api/v1/users', userRouter);
app.use('/api/v1/spotify', spotifyRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

module.exports = app;
