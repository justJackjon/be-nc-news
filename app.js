const express = require('express');
const app = express();
const apiRouter = require('./routes/api-router');
const {
  send404Error,
  psqlErrorHandler,
  customErrorHandler,
  send500Error
} = require('./errors');

app.set('json spaces', 2);

app.use(express.json());

app.use('/api', apiRouter);

app.all('/*', send404Error);

app.use(psqlErrorHandler, customErrorHandler, send500Error);

module.exports = app;
