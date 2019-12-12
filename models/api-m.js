const fsPromises = require('fs').promises;

const fetchEndpointsM = () => {
  return fsPromises.readFile(__dirname + '/../endpoints.json').then(data => {
    let endpoints = JSON.parse(data);
    return JSON.stringify(endpoints, 2, null);
  });
};

module.exports = {
  fetchEndpointsM
};
