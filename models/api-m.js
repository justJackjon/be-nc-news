const fsPromises = require('fs').promises;

const fetchEndpointsM = () => {
  return fsPromises
    .readFile(__dirname + '/../endpoints.json', 'utf-8')
    .then(endpoints => {
      return { endpoints };
    });
};

module.exports = {
  fetchEndpointsM
};
