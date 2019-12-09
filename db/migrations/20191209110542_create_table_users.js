exports.up = function(knex) {
  console.log('creating users table...');
  return knex.schema.createTable('users', usersTable => {
    usersTable.string('username').primary();
    usersTable.string('avatar_url');
    usersTable.string('name');
  });
};

exports.down = function(knex) {
  console.log('removing users table...');
  return knex.schema.dropTable('users');
};
