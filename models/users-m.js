const connection = require('../db/connection');

const fetchUserM = ({ username }) => {
  return connection
    .select()
    .from('users')
    .where('username', '=', username)
    .returning('*')
    .then(([response]) => response);
};

module.exports = {
  fetchUserM
};
