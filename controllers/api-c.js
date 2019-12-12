const { fetchEndpointsM } = require('../models/api-m');

exports.getEndpointsC = (req, res, next) => {
  fetchEndpointsM()
    .then(endpoints => {
      res.status(200).json(endpoints);
    })
    .catch(next);
};
