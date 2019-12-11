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
  it("ERROR UNAVAILABLE ROUTES:404 responds with 404 status code and message, 'Not Found'", () => {
    return request(app)
      .get('/api/not-a-path')
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).to.equal('Not Found');
      });
  });
  describe('/topics', () => {
    it('GET:200 responds with an array of topic objects, each of which should have slug and description properties', () => {
      return request(app)
        .get('/api/topics')
        .then(({ body: { topics } }) => {
          expect(topics).to.be.an('array');
          topics.forEach(topic => {
            expect(topic).to.have.keys(['slug', 'description']);
          });
        });
    });
    it("ERROR INVALID METHODS:405 responds with 405 status code and message, 'Method Not Allowed'", () => {
      const invalidMethods = ['post', 'patch', 'put', 'delete'];
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

  describe('/users/:username', () => {
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
        .get('/api/users/not_a_user_just-some-sneaky-test')
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
            'Invalid Username - Must contain alphanumeric, underscore, or hyphen characters only.'
          );
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
            expect(article.comment_count).to.equal(13);
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
      it('ERROR PATCH:400 responds with 400 status code when url contains malformed/invalid article_id', () => {
        return request(app)
          .patch('/api/articles/i-am-a-dog-and-not-an-id')
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('Invalid Input Syntax');
          });
      });
      it('ERROR PATCH:400 responds with 400 status code if no inc_votes property is present on the request body', () => {
        return request(app)
          .patch('/api/articles/1')
          .send({ not_inc_votes_just_some_imposter: 5 })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('Invalid Input Syntax');
          });
      });
      it('ERROR PATCH:400 responds with 400 status code if the value of inc_votes is an invalid format (such as a string)', () => {
        return request(app)
          .patch('/api/articles/1')
          .send({ inc_votes: 'five' })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('Invalid Input Syntax');
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
    it("INVALID METHODS:405 responds with 405 status code and message, 'Method Not Allowed'", () => {
      const invalidMethods = ['post', 'put', 'delete'];
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
        });
    });
    it('ERROR POST:400 responds with 400 status code when url contains malformed/invalid article_id', () => {
      return request(app)
        .post('/api/articles/i-am-a-dog-and-not-an-id/comments')
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).to.equal('Invalid Input Syntax');
        });
    });
    it("GET:200 responds with status 200 and an articles array of article objects, each of which should have the following properties: 'article_id', 'comment_id', 'votes', 'created_at', 'author', 'body'", () => {
      return request(app)
        .get('/api/articles/1/comments')
        .expect(200)
        .then(({ body: { comments } }) => {
          comments.forEach(comment => {
            expect(comment).to.have.keys([
              'article_id', // <--- guessing it should have this? Docs vague.
              'comment_id',
              'votes',
              'created_at',
              'author',
              'body'
            ]);
          });
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
    it('ERROR GET:404 responds with 404 status code when client GET requests an article with no comments', () => {
      return request(app)
        .get('/api/articles/999999999/comments')
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).to.equal('No Comments Found');
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
  });

  describe('/api/articles', () => {
    it("GET:200 respond with status 200 and an articles array of ALL the article objects, each of which should have the following properties: 'author', 'title', 'article_id', 'topic', 'created_at', 'votes' and 'comment_count'", () => {
      return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body: { articles } }) => {
          articles.forEach(article => {
            expect(article).to.have.keys([
              'author',
              'title',
              // 'body', // <--- should this be ommited? Docs unclear.
              'article_id',
              'topic',
              'created_at',
              'votes',
              'comment_count'
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
          expect(articles[0].comment_count).to.equal(13);
        });
    });
    it("GET:200 accepts query 'sort_by', which sorts the articles by any valid column (defaults to date [in descending order])", () => {
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
    it('ERROR GET:404 responds with status 404 if author exists but does not have any articles associated with them', () => {
      return request(app)
        .get('/api/articles?author=lurker')
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).to.equal('No Articles Found For This Query');
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
      it('ERROR PATCH:404 responds with status 404 if the comment to be patched does not exist within the database', () => {
        return request(app)
          .patch('/api/comments/999999999')
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('No Comment Found, Nothing To Patch');
          });
      });
      it('ERROR PATCH:400 responds with status 400 if the comment_id is not a valid number', () => {
        return request(app)
          .patch('/api/comments/NaN')
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('Bad Request - Malformed comment_id');
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
