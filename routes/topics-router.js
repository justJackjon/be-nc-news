const topicsRouter = require('express').Router();
const { getTopicsC } = require('../controllers/topics-c');

topicsRouter.route('/').get(getTopicsC);

module.exports = topicsRouter;
