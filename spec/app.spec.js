process.env.NODE_ENV = 'test';
const chai = require('chai');
const { expect } = chai;
const request = require('supertest');
const chaiSorted = require('sams-chai-sorted');
// const chaiJsonPattern = require('chai-json-pattern');

const app = require('../app');
const connection = require('../db/connection');

chai.use(chaiSorted);
// chai.use(chaiJsonPattern);

describe('/api', () => {
  beforeEach(() => connection.seed.run());
  after(() => connection.destroy());
  describe('GET', () => {
    it('GET:200 responds with status 200 and JSON describing all the available endpoints on the API', () => {
      return request(app)
        .get('/api')
        .expect(200)
        .then(({ body }) => {
          expect(body).to.be.an('object');
          // TRIED TO USE chai-json-pattern BUT ENCOUNTERED A BUG. REVISIT.
          expect(body).to.have.keys([
            'DELETE /api/articles/:article_id',
            'DELETE /api/comments/:comment_id',
            'GET /api',
            'GET /api/articles',
            'GET /api/articles/:article_id',
            'GET /api/articles/:article_id/comments',
            'GET /api/topics',
            'GET /api/users',
            'GET /api/users/:username',
            'PATCH /api/articles/:article_id',
            'PATCH /api/comments/:comment_id',
            'POST /api/articles',
            'POST /api/articles/:article_id/comments',
            'POST /api/topics',
            'POST /api/users'
          ]);
        });
    });
  });
  it("ERROR UNAVAILABLE ROUTES:404 responds with 404 status code and message, 'Not Found'", () => {
    return request(app)
      .get('/api/not-a-path')
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).to.equal('Not Found');
      });
  });
  it("ERROR INVALID METHODS:405 responds with 405 status code and message, 'Method Not Allowed'", () => {
    const invalidMethods = ['post', 'patch', 'put', 'delete'];
    const methodPromises = invalidMethods.map(method => {
      return request(app)
        [method]('/api')
        .expect(405)
        .then(({ body: { msg } }) => {
          expect(msg).to.equal('Method Not Allowed');
        });
    });
    return Promise.all(methodPromises);
  });
  describe('/topics', () => {
    describe('GET', () => {
      it('GET:200 responds with an array of topic objects, each of which should have slug and description properties', () => {
        return request(app)
          .get('/api/topics')
          .then(({ body: { topics } }) => {
            expect(topics).to.be.an('array');
            topics.forEach(topic => {
              expect(topic).to.have.keys(['slug', 'description']);
            });
            // console.log(topics[0]); possible add more robust testing here??
          });
      });
      it('ERROR GET:404 responds with 404 status code when providing a bad path', () => {
        return request(app)
          .get('/api/not-topics')
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('Not Found');
          });
      });
    });
    describe('POST', () => {
      it('POST:201 responds with status 201 and the posted topic, accepting an object with slug and description properties in the request body', () => {
        return request(app)
          .post('/api/topics')
          .send({ slug: 'test slug', description: 'test description' })
          .expect(201)
          .then(({ body: { topic } }) => {
            expect(topic).to.have.keys(['slug', 'description']);
            expect(topic.slug).to.equal('test slug');
            expect(topic.description).to.equal('test description');
            return request(app).get('/api/topics');
          })
          .then(({ body: { topics } }) => {
            expect(topics).to.be.an('array');
            expect(topics.length).to.equal(4); // <-- there are only 3 topics in the test db before the POST request.
          });
      });
      it('ERROR POST:400 responds with status 400 when POST request does not include all the required keys', () => {
        const missingSlug = request(app)
          .post('/api/topics')
          .send({ description: 'test description' })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('Bad Request');
          });
        const missingDescription = request(app)
          .post('/api/topics')
          .send({ description: 'test description' })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('Bad Request');
          });
        return Promise.all([missingSlug, missingDescription]);
      });
    });
    it("ERROR INVALID METHODS:405 responds with 405 status code and message, 'Method Not Allowed'", () => {
      const invalidMethods = ['patch', 'put', 'delete'];
      const methodPromises = invalidMethods.map(method => {
        return request(app)
          [method]('/api/topics')
          .expect(405)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('Method Not Allowed');
          });
      });
      return Promise.all(methodPromises);
    });
  });

  describe('/users', () => {
    describe('GET', () => {
      it("GET:200 responds with status 200 and a users array of ALL the user objects, each of which should have the following properties: 'username', 'name' and 'avatar_url'", () => {
        return request(app)
          .get('/api/users')
          .expect(200)
          .then(({ body: { users } }) => {
            expect(users).to.be.an('array');
            users.forEach(user => {
              expect(user).to.have.keys(['username', 'name', 'avatar_url']);
            });
            expect(users.length).to.equal(4); // <-- there are only 4 users in the test db
          });
      });
    });
    describe('POST', () => {
      it('POST:201 responds with status 201 and the posted user, accepting an object with username, name and avatar_url properties in the request body', () => {
        return request(app)
          .post('/api/users')
          .send({
            username: 'test_user',
            name: 'test name',
            avatar_url:
              'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png'
          })
          .expect(201)
          .then(({ body: { user } }) => {
            expect(user).to.have.keys(['username', 'name', 'avatar_url']);
            expect(user.username).to.equal('test_user');
            expect(user.name).to.equal('test name');
            expect(user.avatar_url).to.equal(
              'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png'
            );
            return request(app).get('/api/users');
          })
          .then(({ body: { users } }) => {
            expect(users).to.be.an('array');
            expect(users.length).to.equal(5); // <-- there are only 4 users in the test db before the POST request.
          });
      });
      it('ERROR POST:400 responds with status 400 when POST request does not include all the required keys', () => {
        const missingUsername = request(app)
          .post('/api/users')
          .send({
            name: 'test name',
            avatar_url:
              'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png'
          })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('Bad Request');
          });
        const missingName = request(app)
          .post('/api/users')
          .send({
            username: 'test_user',
            avatar_url:
              'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png'
          })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('Bad Request');
          });
        const missingAvatarUrl = request(app)
          .post('/api/users')
          .send({
            username: 'test_user',
            name: 'test name'
          })
          .expect(201); // <--- NOT a required key.
        return Promise.all([missingUsername, missingName, missingAvatarUrl]);
      });
    });
  });

  describe('/users/:username', () => {
    describe('GET', () => {
      it('GET:200 responds with a user object which should have username, avatar_url and name properties', () => {
        return request(app)
          .get('/api/users/butter_bridge')
          .expect(200)
          .then(({ body: { user } }) => {
            expect(user).to.be.an('object');
            expect(user).to.have.keys(['username', 'avatar_url', 'name']);
            expect(user.username).to.equal('butter_bridge');
          });
      });
      it('GET:404 responds with status 404 when client GET requests a user that does not exist', () => {
        return request(app)
          .get('/api/users/non-existent_user') // <--- Must match /^[a-z0-9_-]{3,30}$/i
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('No Such User');
          });
      });
      it('ERROR GET:400 responds with 400 status code when url contains malformed/invalid username. Username must contain alphanumeric, underscore, or hyphen characters only.', () => {
        return request(app)
          .get('/api/users/!!!I AM AN INVALID USERNAME!!!!')
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal(
              'Invalid Username - Must contain between 3-30 alphanumeric, underscore, or hyphen characters only.'
            );
          });
      });
    });
    it("INVALID METHODS:405 responds with 405 status code and message, 'Method Not Allowed'", () => {
      const invalidMethods = ['post', 'patch', 'put', 'delete'];
      const methodPromises = invalidMethods.map(method => {
        return request(app)
          [method]('/api/users/butter_bridge')
          .expect(405)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('Method Not Allowed');
          });
      });
      return Promise.all(methodPromises);
    });
  });

  describe('/articles/:article_id', () => {
    describe('GET', () => {
      it('GET:200 responds with an article object, which should have author, title, article_id, body, topic, created_at, votes, and comment_count properties', () => {
        return request(app)
          .get('/api/articles/1')
          .expect(200)
          .then(({ body: { article } }) => {
            expect(article).to.be.an('object');
            expect(article).to.have.keys([
              'author',
              'title',
              'article_id',
              'body',
              'topic',
              'created_at',
              'votes',
              'comment_count'
            ]);
            expect(article.article_id).to.equal(1);
          });
      });
      it('GET:200 responds with an article object containing a comment_count property which holds the total count of all the comments with the corresponding article_id', () => {
        return request(app)
          .get('/api/articles/1')
          .expect(200)
          .then(({ body: { article } }) => {
            expect(article.article_id).to.equal(1);
            expect(article.comment_count).to.equal('13');
          });
      });
      it('ERROR GET:400 responds with 400 status code when url contains malformed/invalid article_id', () => {
        return request(app)
          .get('/api/articles/i-am-a-dog-and-not-an-id')
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('Invalid Input Syntax');
          });
      });
      it("ERROR GET:404 responds with 404 status code when url contains well formed article_id that doesn't exist in the database", () => {
        return request(app)
          .get('/api/articles/999999')
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('No Such Article');
          });
      });
    });
    describe('PATCH', () => {
      it('PATCH:200 accepts an object in the form { inc_votes: newVote } in the request body', () => {
        return request(app)
          .patch('/api/articles/1')
          .send({ inc_votes: 1 })
          .expect(200);
      });
      it('PATCH:200 responds with 200 status code and the updated article, where the number of votes and been increased by the number specified in the request body', () => {
        return request(app)
          .patch('/api/articles/1')
          .send({ inc_votes: 5 })
          .expect(200)
          .then(({ body: { article } }) => {
            expect(article).to.have.keys([
              'article_id',
              'title',
              'body',
              'votes',
              'topic',
              'author',
              'created_at'
            ]);
            expect(article.article_id).to.equal(1);
            expect(article.votes).to.equal(105);
          });
      });
      it('ERROR PATCH:200 responds with 200 status code and correctly patched article, ignoring any additional properties present in the request body', () => {
        return request(app)
          .patch('/api/articles/2')
          .send({
            inc_votes: 5,
            some_additional_property: 'some_additional_value',
            not_votes: 10
          })
          .expect(200)
          .then(({ body: { article } }) => {
            expect(article).to.have.keys([
              'article_id',
              'title',
              'body',
              'votes',
              'topic',
              'author',
              'created_at'
            ]);
            expect(article.article_id).to.equal(2);
            expect(article.votes).to.equal(5);
          });
      });
      it('ERROR PATCH:200 responds with 200 status code and sends the unchanged article to the client, ignoring a patch request with no information in the request body', () => {
        return request(app)
          .patch('/api/articles/1')
          .send({})
          .expect(200)
          .then(({ body: { article } }) => {
            expect(article).to.have.keys([
              'article_id',
              'title',
              'body',
              'votes',
              'topic',
              'author',
              'created_at'
            ]);
            expect(article.article_id).to.equal(1);
            expect(article.votes).to.equal(100);
          });
      });
      it('ERROR PATCH:400 responds with 400 status code when url contains malformed/invalid article_id', () => {
        return request(app)
          .patch('/api/articles/i-am-a-dog-and-not-an-id')
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('Invalid Input Syntax');
          });
      });
      it('ERROR PATCH:200 responds with 200 status code and the unchanged article if no inc_votes property is present on the request body', () => {
        return request(app)
          .patch('/api/articles/1')
          .send({ not_inc_votes_just_some_imposter: 5 })
          .expect(200)
          .then(({ body: { article } }) => {
            expect(article).to.have.keys([
              'article_id',
              'title',
              'body',
              'votes',
              'topic',
              'author',
              'created_at'
            ]);
            expect(article.article_id).to.equal(1);
            expect(article.votes).to.equal(100);
          });
      });
      it('ERROR PATCH:400 responds with 400 status code if the value of inc_votes is an invalid format (such as a string)', () => {
        return request(app)
          .patch('/api/articles/1')
          .send({ inc_votes: 'five' })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('Bad Request - Invalid Format For inc_votes');
          });
      });
      it("ERROR PATCH:404 responds with 404 status code when url contains well formed article_id that doesn't exist in the database", () => {
        return request(app)
          .patch('/api/articles/999999')
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('No Such Article - Unable To Patch');
          });
      });
    });
    describe('DELETE', () => {
      it('DELETE:204 responds with status 204 and should delete the given article by article_id', () => {
        return request(app)
          .delete('/api/articles/1')
          .expect(204)
          .then(() => {
            return connection
              .select()
              .from('articles')
              .where('article_id', '=', 1)
              .returning('*');
          })
          .then(response => {
            expect(response).to.eql([]);
          })
          .then(() => {
            return connection
              .select()
              .from('articles')
              .returning('*')
              .then(articlesArr => {
                expect(articlesArr.length).to.equal(11); // Before the delete there are 12 articles in test db
              });
          });
      });
      it('ERROR DELETE:404 responds with status 404 if the article requested does not exist within the database', () => {
        return request(app)
          .delete('/api/articles/999999999')
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('No Article Found, Nothing To Delete');
          });
      });
      it('ERROR DELETE:400 responds with status 400 if the article_id is not a valid number', () => {
        return request(app)
          .delete('/api/articles/NaN')
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('Bad Request - Malformed article_id');
          });
      });
    });
    it("INVALID METHODS:405 responds with 405 status code and message, 'Method Not Allowed'", () => {
      const invalidMethods = ['post', 'put'];
      const methodPromises = invalidMethods.map(method => {
        return request(app)
          [method]('/api/articles/1')
          .expect(405)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('Method Not Allowed');
          });
      });
      return Promise.all(methodPromises);
    });
  });

  describe('/articles/:article_id/comments', () => {
    describe('GET', () => {
      it("GET:200 responds with status 200 and an articles array of article objects, each of which should have the following properties: 'article_id', 'comment_id', 'votes', 'created_at', 'author', 'body'", () => {
        return request(app)
          .get('/api/articles/1/comments?limit=99') // <--- limit query is tested below...
          .expect(200)
          .then(({ body: { comments } }) => {
            comments.forEach(comment => {
              expect(comment).to.have.keys([
                'article_id',
                'comment_id',
                'votes',
                'created_at',
                'author',
                'body'
              ]);
            });
            expect(comments.length).to.equal(13);
          });
      });
      it('GET:200 responds with status 200 and only returns an array of article objects which match the correct article_id', () => {
        const checkId1 = request(app)
          .get('/api/articles/1/comments')
          .expect(200)
          .then(({ body: { comments } }) => {
            comments.forEach(comment => {
              expect(comment.article_id).to.equal(1);
            });
          });
        const checkId5 = request(app)
          .get('/api/articles/5/comments')
          .expect(200)
          .then(({ body: { comments } }) => {
            comments.forEach(comment => {
              expect(comment.article_id).to.equal(5);
            });
          });
        const checkId6 = request(app)
          .get('/api/articles/6/comments')
          .expect(200)
          .then(({ body: { comments } }) => {
            comments.forEach(comment => {
              expect(comment.article_id).to.equal(6);
            });
          });
        const checkId9 = request(app)
          .get('/api/articles/9/comments')
          .expect(200)
          .then(({ body: { comments } }) => {
            comments.forEach(comment => {
              expect(comment.article_id).to.equal(9);
            });
          });
        return Promise.all([checkId1, checkId5, checkId6, checkId9]);
      });
      it("GET:200 accepts query 'sort_by', which sorts the comments by any valid column (defaults to created_at [in descending order])", () => {
        const defaultSort = request(app)
          .get('/api/articles/1/comments')
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).to.be.sortedBy('created_at', { descending: true });
          });
        const sortedByVotesDesc = request(app)
          .get('/api/articles/1/comments?sort_by=votes')
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).to.be.sortedBy('votes', { descending: true });
          });
        return Promise.all([defaultSort, sortedByVotesDesc]);
      });
      it("GET:200 accepts query 'order', which can be set to asc or desc for ascending or descending (defaults to descending)", () => {
        const testDefault = request(app)
          .get('/api/articles/1/comments?sort_by=author')
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).to.be.sortedBy('author', { descending: true });
          });
        const testAsc = request(app)
          .get('/api/articles/1/comments?sort_by=author&order=asc')
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).to.be.sortedBy('author', { descending: false });
          });
        const testDesc = request(app)
          .get('/api/articles/1/comments?sort_by=author&order=desc')
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).to.be.sortedBy('author', { descending: true });
          });
        return Promise.all([testDefault, testAsc, testDesc]);
      });
      it("GET:200 accepts query 'limit', which has a default value of 10 and limits the number of comments sent back to the client", () => {
        const defaultLimit = request(app)
          .get('/api/articles/1/comments')
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments.length).to.equal(10);
          });
        const specifiedLimit = request(app)
          .get('/api/articles/1/comments?limit=5')
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments.length).to.equal(5);
          });
        return Promise.all([defaultLimit, specifiedLimit]);
      });
      it("GET:200 accepts query 'p', which has a default value of 1 and, based upon the limit query, will send a subset of results according to the page number (p) requested", () => {
        const defaultPageDefaultLimit = request(app)
          // 'Sort_by' and 'order' queries is tested above. Required below for these tests so that each test can always expect the same comment_id to be present at a certain index.
          .get('/api/articles/1/comments?sort_by=comment_id&order=asc')
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments.length).to.equal(10);
            expect(comments[0].comment_id).to.equal(2);
            expect(comments[9].comment_id).to.equal(11);
          });
        const defaultPageSpecifiedLimit = request(app)
          .get('/api/articles/1/comments?limit=5&sort_by=comment_id&order=asc')
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments.length).to.equal(5);
            expect(comments[0].comment_id).to.equal(2);
            expect(comments[4].comment_id).to.equal(6);
          });
        const specifiedPageDefaultLimit = request(app)
          .get('/api/articles/1/comments?p=2&sort_by=comment_id&order=asc')
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments.length).to.equal(3); // <-- There are only 13 comments for article_id 1 in the test database, so the second page of results should equal 3
            expect(comments[0].comment_id).to.equal(12);
            expect(comments[2].comment_id).to.equal(18);
          });
        const specifiedPageSpecifiedLimit = request(app)
          .get(
            '/api/articles/1/comments?p=2&limit=5&sort_by=comment_id&order=asc'
          )
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments.length).to.equal(5);
            expect(comments[0].comment_id).to.equal(7);
            expect(comments[4].comment_id).to.equal(11);
          });
        return Promise.all([
          defaultPageDefaultLimit,
          defaultPageSpecifiedLimit,
          specifiedPageDefaultLimit,
          specifiedPageSpecifiedLimit
        ]);
      });
      it('ERROR GET:200 responds with 200 status code and an empty array when client GET requests an article with no comments', () => {
        return request(app)
          .get('/api/articles/2/comments') // article_ids 1, 5, 6 and 9 have comments
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).to.eql([]);
          });
      });
      it('ERROR GET:400 responds with 400 status code when url contains malformed/invalid article_id', () => {
        return request(app)
          .get('/api/articles/i-am-a-dog-and-not-an-id/comments')
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('Invalid Input Syntax');
          });
      });
      it('ERROR GET:404 responds with 404 status code when when given a valid article_id that does not exist', () => {
        return request(app)
          .get('/api/articles/1000/comments')
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('No Such Article');
          });
      });
    });
    describe('POST', () => {
      it('POST:201 responds with status 201 and the posted comment, accepting an object with username and body properties in the request body', () => {
        return request(app)
          .post('/api/articles/1/comments')
          .send({ username: 'butter_bridge', body: 'test comment' })
          .expect(201)
          .then(({ body: { comment } }) => {
            expect(comment).to.have.keys([
              'comment_id',
              'author',
              'article_id',
              'votes',
              'created_at',
              'body'
            ]);
            expect(comment.author).to.equal('butter_bridge');
            expect(comment.body).to.equal('test comment');
            expect(comment.article_id).to.equal(1);
            return request(app).get('/api/articles/1/comments?limit=99');
          })
          .then(({ body: { comments } }) => {
            expect(comments).to.be.an('array');
            expect(comments.length).to.equal(14); // <-- there are only 13 comments for article_id 1 in the test db before the POST request.
          });
      });
      it('ERROR POST:400 responds with status 400 when POST request does not include all the required keys', () => {
        const missingBody = request(app)
          .post('/api/articles/1/comments')
          .send({ username: 'butter_bridge' })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('Bad Request');
          });
        const missingUsername = request(app)
          .post('/api/articles/1/comments')
          .send({ body: 'test comment' })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('Bad Request');
          });
        return Promise.all([missingBody, missingUsername]);
      });
      it('ERROR POST:400 responds with 400 status code when url contains malformed/invalid article_id', () => {
        return request(app)
          .post('/api/articles/i-am-a-dog-and-not-an-id/comments')
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('Invalid Input Syntax');
          });
      });
    });
  });

  describe('/articles', () => {
    describe('GET', () => {
      it("GET:200 responds with status 200 and an articles array of ALL the article objects, each of which should have the following properties: 'author', 'title', 'article_id', 'topic', 'created_at', 'votes','comment_count' and 'total_count'", () => {
        return request(app)
          .get('/api/articles?limit=99') // <--- 'limit' query is tested below - this needs to be specified as number of articles to expect is 12, yet default limit value is 10
          .expect(200)
          .then(({ body: { articles } }) => {
            articles.forEach(article => {
              expect(article).to.have.keys([
                'author',
                'title',
                'article_id',
                'topic',
                'created_at',
                'votes',
                'comment_count',
                'total_count'
              ]);
            });
            expect(articles.length).to.equal(12);
          });
      });
      it('GET:200 should have a comment_count property which is the total count of all the comments with this article_id', () => {
        return request(app)
          .get('/api/articles')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles[0].comment_count).to.equal('13');
          });
      });
      it("GET:200 accepts query 'sort_by', which sorts the articles by any valid column (defaults to created_at [in descending order])", () => {
        const defaultSort = request(app)
          .get('/api/articles')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).to.be.sortedBy('created_at', { descending: true });
          });
        const sortedByAuthorDesc = request(app)
          .get('/api/articles?sort_by=author')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).to.be.sortedBy('author', {
              descending: true
            });
          });
        return Promise.all([defaultSort, sortedByAuthorDesc]);
      });
      it("GET:200 accepts query 'order', which can be set to asc or desc for ascending or descending (defaults to descending)", () => {
        const testDefault = request(app)
          .get('/api/articles?sort_by=title')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).to.be.sortedBy('title', { descending: true });
          });
        const testAsc = request(app)
          .get('/api/articles?sort_by=title&order=asc')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).to.be.sortedBy('title', { descending: false });
          });
        const testDesc = request(app)
          .get('/api/articles?sort_by=title&order=desc')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).to.be.sortedBy('title', { descending: true });
          });
        return Promise.all([testDefault, testAsc, testDesc]);
      });
      it("GET:200 accepts query 'author', which filters the articles by the username value specified in the query", () => {
        return request(app)
          .get('/api/articles?author=rogersop')
          .expect(200)
          .then(({ body: { articles } }) => {
            articles.forEach(article => {
              expect(article.author).to.equal('rogersop');
            });
          });
      });
      it("GET:200 accepts query 'topic', which filters the articles by the topic value specified in the query", () => {
        return request(app)
          .get('/api/articles?topic=mitch')
          .expect(200)
          .then(({ body: { articles } }) => {
            articles.forEach(article => {
              expect(article.topic).to.equal('mitch');
            });
          });
      });
      it("GET:200 accepts query 'limit', which has a default value of 10 and limits the number of articles sent back to the client", () => {
        const defaultLimit = request(app)
          .get('/api/articles')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).to.equal(10);
          });
        const specifiedLimit = request(app)
          .get('/api/articles?limit=5')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).to.equal(5);
          });
        return Promise.all([defaultLimit, specifiedLimit]);
      });
      it("GET:200 accepts query 'p', which has a default value of 1 and, based upon the limit query, will send a subset of results according to the page number (p) requested", () => {
        const defaultPageDefaultLimit = request(app)
          .get('/api/articles')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).to.equal(10);
            articles.forEach((article, index) => {
              expect(article.article_id).to.equal(index + 1);
            });
          });
        const defaultPageSpecifiedLimit = request(app)
          .get('/api/articles?limit=5')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).to.equal(5);
            articles.forEach((article, index) => {
              expect(article.article_id).to.equal(index + 1);
            });
          });
        const specifiedPageDefaultLimit = request(app)
          .get('/api/articles?p=2')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).to.equal(2); // <-- There are only 12 articles in the test database, so the second page of results should equal 2
            articles.forEach((article, index) => {
              expect(article.article_id).to.equal(index + 11);
            });
          });
        const specifiedPageSpecifiedLimit = request(app)
          .get('/api/articles?p=2&limit=5')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).to.equal(5);
            articles.forEach((article, index) => {
              expect(article.article_id).to.equal(index + 6);
            });
          });
        return Promise.all([
          defaultPageDefaultLimit,
          defaultPageSpecifiedLimit,
          specifiedPageDefaultLimit,
          specifiedPageSpecifiedLimit
        ]);
      });
      it("GET:200 should have a total_count property, displaying the total number of articles with any filters applied, discounting any limit specified in the 'limit' query (defaults at 10)", () => {
        const countAuthor = request(app)
          .get('/api/articles?author=icellusedkars&limit=2')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).to.equal(2);
            articles.forEach(article => {
              expect(article.total_count).to.equal(6);
            });
          });
        const countTopic = request(app)
          .get('/api/articles?topic=mitch&limit=3')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).to.equal(3);
            articles.forEach(article => {
              expect(article.total_count).to.equal(11);
            });
          });
        return Promise.all([countAuthor, countTopic]);
      });
      it('ERROR GET:200 responds with status 200 and an empty array when client requests articles for a topic that does exist, but has no articles', () => {
        return request(app)
          .get('/api/articles?topic=paper')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).to.eql([]);
          });
      });
      it("ERROR GET:404 responds with status 404 and 'No Such User' when the client requests a user that does not exist in the database", () => {
        return request(app)
          .get('/api/articles?author=not-an-author')
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('No Such User');
          });
      });
      it('ERROR GET:404 responds with status 404 when provided with a non-existent topic', () => {
        return request(app)
          .get('/api/articles?topic=not-a-topic')
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('Topic Not Found');
          });
      });
      it("ERROR GET:400 responds with status 400 if client attempts to sort_by a column that doesn't exist", () => {
        return request(app)
          .get('/api/articles?sort_by=non-existent-column')
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('This Column Does Not Exist');
          });
      });
      it("ERROR GET:200 responds with status 200 and defaults to descending order if the 'order' query value is malformed (!=='asc'/'desc')", () => {
        return request(app)
          .get('/api/articles?order=not-a-valid-query-value')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).to.be.sortedBy('created_at', { descending: true });
          });
      });
      it('ERROR GET:200 responds with status 200 and an empty array if author exists but does not have any articles associated with them', () => {
        return request(app)
          .get('/api/articles?author=lurker')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).to.be.an('array');
            expect(articles).to.eql([]);
          });
      });
    });
    describe('POST', () => {
      it('POST:201 responds with status 201 and the posted article, accepting an object with author, topic, title and body properties in the request body', () => {
        return request(app)
          .post('/api/articles')
          .send({
            author: 'rogersop',
            topic: 'mitch',
            title: 'test title',
            body: 'test body'
          })
          .expect(201)
          .then(({ body: { article } }) => {
            expect(article).to.be.an('object');
            expect(article.author).to.equal('rogersop');
            expect(article.topic).to.equal('mitch');
            expect(article.title).to.equal('test title');
            expect(article.body).to.equal('test body');
            expect(article).to.have.keys([
              'author',
              'title',
              'body',
              'article_id',
              'topic',
              'created_at',
              'votes'
            ]);
            return request(app).get('/api/articles?limit=99');
          })
          .then(({ body: { articles } }) => {
            expect(articles).to.be.an('array');
            expect(articles.length).to.equal(13); // <-- there are only 12 articles in the test db before the POST request.
          });
      });
      it('ERROR POST:400 responds with status 400 when POST request does not include all the required keys', () => {
        const missingAuthor = request(app)
          .post('/api/articles')
          .send({
            topic: 'mitch',
            title: 'test title',
            body: 'test body'
          })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('Bad Request');
          });
        const missingTopic = request(app)
          .post('/api/articles')
          .send({
            author: 'rogersop',
            title: 'test title',
            body: 'test body'
          })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('Bad Request');
          });
        const missingTitle = request(app)
          .post('/api/articles')
          .send({
            author: 'rogersop',
            topic: 'mitch',
            body: 'test body'
          })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('Bad Request');
          });
        const missingBody = request(app)
          .post('/api/articles')
          .send({
            author: 'rogersop',
            topic: 'mitch',
            title: 'test title'
          })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('Bad Request');
          });
        return Promise.all([
          missingAuthor,
          missingTopic,
          missingTitle,
          missingBody
        ]);
      });
    });
  });

  describe('/comments/:comment_id', () => {
    describe('PATCH', () => {
      it("PATCH:200 responds with status 200 and the updated comment, accepts an object in the request body in the form { inc_votes: 1 } and INCREMENTS the comment's vote property by 1", () => {
        return request(app)
          .patch('/api/comments/1')
          .send({ inc_votes: 1 })
          .expect(200)
          .then(({ body: { comment } }) => {
            // comment with comment_id: 1 has 16 votes before PATCH - id2 = 14, id3 = 100.
            expect(comment.votes).to.equal(17);
          });
      });
      it("PATCH:200 responds with status 200 and the updated comment, accepts an object in the request body in the form { inc_votes: -1 } and DECREMENTS the comment's vote property by 1", () => {
        return request(app)
          .patch('/api/comments/1')
          .send({ inc_votes: -1 })
          .expect(200)
          .then(({ body: { comment } }) => {
            // comment with comment_id: 1 has 16 votes before PATCH - id2 = 14, id3 = 100.
            expect(comment.votes).to.equal(15);
          });
      });
      it('ERROR PATCH:200 responds with status 200 and the unchanged comment when no inc_votes property is provided in the request body', () => {
        return request(app)
          .patch('/api/comments/1')
          .send({ foobar: 1 })
          .expect(200)
          .then(({ body: { comment } }) => {
            // comment with comment_id: 1 has 16 votes before PATCH - id2 = 14, id3 = 100.
            expect(comment.votes).to.equal(16);
          });
      });
      it('ERROR PATCH:404 responds with status 404 if the comment to be patched does not exist within the database', () => {
        return request(app)
          .patch('/api/comments/999999999')
          .send({ inc_votes: 1 })
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('No Comment Found, Nothing To Patch');
          });
      });
      it('ERROR PATCH:400 responds with status 400 if the comment_id is not a valid number', () => {
        return request(app)
          .patch('/api/comments/NaN')
          .send({ inc_votes: 1 })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('Bad Request');
          });
      });
      it('ERROR PATCH:400 responds with status 400 when sent an invalid inc_votes value', () => {
        return request(app)
          .patch('/api/comments/1')
          .send({ inc_votes: -111 })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('Bad Request');
          });
      });
    });
    describe('DELETE', () => {
      it('DELETE:204 responds with status 204 and should delete the given comment by comment_id', () => {
        return request(app)
          .delete('/api/comments/1')
          .expect(204)
          .then(() => {
            return connection
              .select()
              .from('comments')
              .where('comment_id', '=', 1)
              .returning('*');
          })
          .then(response => {
            expect(response).to.eql([]);
          })
          .then(() => {
            return connection
              .select()
              .from('comments')
              .returning('*')
              .then(commentsArr => {
                expect(commentsArr.length).to.equal(17); // Before the delete there are 18 comments in test db
              });
          });
      });
      it('ERROR DELETE:404 responds with status 404 if the comment requested does not exist within the database', () => {
        return request(app)
          .delete('/api/comments/999999999')
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('No Comment Found, Nothing To Delete');
          });
      });
      it('ERROR DELETE:400 responds with status 400 if the comment_id is not a valid number', () => {
        return request(app)
          .delete('/api/comments/NaN')
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('Bad Request - Malformed comment_id');
          });
      });
    });
  });
});
