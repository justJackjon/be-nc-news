process.env.NODE_ENV = 'test';
const chai = require('chai');
const { expect } = chai;
const request = require('supertest');
const chaiSorted = require('sams-chai-sorted');

const app = require('../app');
// const knex = require('../db/connection');

chai.use(chaiSorted);

knex.migrate.rollback().then(() => knex.migrate.latest());

describe('/api', () => {
  after(() => {
    return;
  });
  describe('/topics', () => {});
});
