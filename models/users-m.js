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

const checkUserExists = username => {
  return connection
    .select()
    .from('users')
    .returning('*')
    .then(userArr => {
      const user = userArr.filter(user => user.username === username);
      if (user.length) return true;
      return false;
    });
};

module.exports = {
  fetchUserM,
  checkUserExists
};
