const fsPromises = require('fs').promises;

const fetchEndpointsM = () => {
  return fsPromises.readFile(__dirname + '/../endpoints.json').then(data => {
    return JSON.parse(data);
  });
};

module.exports = {
  fetchEndpointsM
};
