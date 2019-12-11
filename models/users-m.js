const connection = require('../db/connection');

const fetchUserM = ({ username }) => {
  if (!username.match(/^[a-z0-9_-]+$/i)) {
    return Promise.reject({
      status: 400,
      message:
        'Invalid Username - Must contain alphanumeric, underscore, or hyphen characters only.'
    });
  }
  return connection
    .select()
    .from('users')
    .where('username', '=', username)
    .returning('*')
    .then(([user]) => {
      if (user) return user;
      return Promise.reject({ status: 404, message: 'No Such User' });
    });
};

module.exports = {
  fetchUserM
};
