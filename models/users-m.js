const connection = require('../db/connection');

const fetchUserM = ({ username }) => {
  if (!username.match(/^[a-z0-9_-]{3,30}$/i)) {
    return Promise.reject({
      status: 400,
      message:
        'Invalid Username - Must contain between 3-30 alphanumeric, underscore, or hyphen characters only.'
    });
  }
  return connection
    .select()
    .from('users')
    .where('username', '=', username)
    .returning('*')
    .then(([user]) => {
      if (user) return { user };
      return Promise.reject({ status: 404, message: 'No Such User' });
    });
};

const selectUsersArrayM = () => {
  return connection
    .select()
    .from('users')
    .returning('*')
    .then(users => ({ users }));
};

const insertUserM = ({ username, name, avatar_url }) => {
  return connection('users')
    .insert({ username, name, avatar_url })
    .returning('*')
    .then(([user]) => ({ user }));
};

module.exports = {
  fetchUserM,
  selectUsersArrayM,
  insertUserM
};
