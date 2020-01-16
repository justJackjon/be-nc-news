const express = require('express');
const cors = require('cors');
const apiRouter = require('./routes/api-router');
const {
  send404Error,
  psqlErrorHandler,
  customErrorHandler,
  send500Error
} = require('./errors');

const app = express();

app.use(cors());

app.set('json spaces', 2);

app.use(express.json());

app.use('/api', apiRouter);

app.all('/*', send404Error);

app.use(psqlErrorHandler, customErrorHandler, send500Error);

module.exports = app;
