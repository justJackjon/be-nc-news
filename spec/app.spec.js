process.env.NODE_ENV = 'test';
const chai = require('chai');
const { expect } = chai;
const request = require('supertest');
const chaiSorted = require('sams-chai-sorted');

const app = require('../app');
const connection = require('../db/connection');

chai.use(chaiSorted);

describe.only('/api', () => {
  beforeEach(() => connection.seed.run());
  after(() => connection.destroy());
  describe('/topics', () => {
    it('GET:200 responds with an array of topic objects, each of which should have slug and description properties', () => {
      return request(app)
        .get('/api/topics')
        .then(response => {
          expect(response.body.topics).to.be.an('array');
          expect(response.body.topics[0]).to.have.keys(['slug', 'description']);
        });
    });
  });
  describe('/users', () => {
    it('GET:200 responds with a user object which should have username, avatar_url and name properties', () => {
      return request(app)
        .get('/api/users/butter_bridge')
        .expect(200)
        .then(response => {
          expect(response.body.user).to.be.an('object');
          expect(response.body.user).to.have.keys([
            'username',
            'avatar_url',
            'name'
          ]);
          expect(response.body.user.username).to.equal('butter_bridge');
        });
    });
  });
});
