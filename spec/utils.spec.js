const { expect } = require('chai');
const {
  formatDates,
  makeRefObj,
  formatComments
} = require('../db/utils/utils');

describe('formatDates', () => {
  const input = [
    {
      title: 'Living in the shadow of a great man',
      topic: 'mitch',
      author: 'butter_bridge',
      body: 'I find this existence challenging',
      created_at: 1542284514171,
      votes: 100
    },
    {
      title: 'Sony Vaio; or, The Laptop',
      topic: 'mitch',
      author: 'icellusedkars',
      body:
        'Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me.',
      created_at: 1416140514171
    },
    {
      title: 'Eight pug gifs that remind me of mitch',
      topic: 'mitch',
      author: 'icellusedkars',
      body: 'some gifs',
      created_at: 1289996514171
    }
  ];
  it('Should be able to take an array (list) of objects and return a new array', () => {
    expect(formatDates([{}, {}, {}])).to.be.an('array');
  });
  it('Should return a new array and not mutate the argument array', () => {
    const input = [{}, {}, {}];
    const control = [{}, {}, {}];
    expect(formatDates(input)).to.not.equal(input);
    expect(input).to.eql(control);
  });
  it('An item in the new array must have its timestamp converted into a Javascript date object', () => {
    const actual = formatDates(input);
    expect(actual[0].created_at).to.be.a('date');
  });
  it('Everything else in the item must be maintained', () => {
    const actual = formatDates(input)[0];
    const expected = [
      'title',
      'topic',
      'author',
      'body',
      'created_at',
      'votes'
    ];
    expect(actual).to.have.keys(expected);
    expect(actual.title).to.equal('Living in the shadow of a great man');
    expect(actual.topic).to.equal('mitch');
    expect(actual.author).to.equal('butter_bridge');
    expect(actual.body).to.equal('I find this existence challenging');
    expect(actual.votes).to.equal(100);
  });
  it('Must work for multiple items in the argument array', () => {
    const actual = formatDates(input);
    actual.forEach(object => {
      expect(object.created_at).to.be.a('date');
    });
  });
});

describe('makeRefObj', () => {
  it('Should be able to take an array (list) of objects and return an object', () => {
    expect(makeRefObj([{}, {}, {}])).to.be.an('object');
  });
  it('Should not mutate the argument array', () => {
    const input = [{}, {}, {}];
    const control = [{}, {}, {}];
    makeRefObj(input);
    expect(input).to.not.equal(control);
    expect(input).to.eql(control);
  });
  it("Should return a reference object. The reference object must be keyed by an item's title, with the value being the item's corresponding id.", () => {
    const input = [
      {
        article_id: 1,
        title: 'Living in the shadow of a great man',
        topic: 'mitch',
        author: 'butter_bridge',
        body: 'I find this existence challenging',
        created_at: 1542284514171,
        votes: 100
      }
    ];
    const expected = {
      'Living in the shadow of a great man': 1
    };
    expect(makeRefObj(input)).to.eql(expected);
  });
  it('Should work for multiple objects in the argument array', () => {
    const input = [
      {
        article_id: 1,
        title: 'Living in the shadow of a great man',
        topic: 'mitch',
        author: 'butter_bridge',
        body: 'I find this existence challenging',
        created_at: 1542284514171,
        votes: 100
      },
      {
        article_id: 2,
        title: 'Sony Vaio; or, The Laptop',
        topic: 'mitch',
        author: 'icellusedkars',
        body:
          'Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me.',
        created_at: 1416140514171
      },
      {
        article_id: 3,
        title: 'Eight pug gifs that remind me of mitch',
        topic: 'mitch',
        author: 'icellusedkars',
        body: 'some gifs',
        created_at: 1289996514171
      }
    ];
    const expected = {
      'Living in the shadow of a great man': 1,
      'Sony Vaio; or, The Laptop': 2,
      'Eight pug gifs that remind me of mitch': 3
    };
    expect(makeRefObj(input)).to.eql(expected);
  });
});

describe('formatComments', () => {
  const refObj = {
    "They're not exactly dogs, are they?": 1,
    'Living in the shadow of a great man': 2,
    'UNCOVERED: catspiracy to bring down democracy': 3
  };
  const input = [
    {
      body:
        "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
      belongs_to: "They're not exactly dogs, are they?",
      created_by: 'butter_bridge',
      votes: 16,
      created_at: 1511354163389
    },
    {
      body:
        'The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.',
      belongs_to: 'Living in the shadow of a great man',
      created_by: 'butter_bridge',
      votes: 14,
      created_at: 1479818163389
    },
    {
      body:
        'Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works.',
      belongs_to: 'Living in the shadow of a great man',
      created_by: 'icellusedkars',
      votes: 100,
      created_at: 1448282163389
    }
  ];
  it('Should be able to take an array of comment objects (comments) and a reference object, and return a new array', () => {
    const comments = [{}, {}, {}];
    expect(formatComments(comments, refObj)).to.be.an('array');
  });
  it('Should return a new array and not mutate the argument array', () => {
    const input = [{}, {}, {}];
    const control = [{}, {}, {}];
    expect(formatComments(input, refObj)).to.not.equal(input);
    expect(input).to.eql(control);
  });
  it('Should format a comment object so that its created_by property is renamed to an author key', () => {
    const actual = formatComments(input, refObj)[0];
    expect(actual.author).to.equal('butter_bridge');
  });
  it('Should format a comment object so that its belongs_to property is renamed to an article_id key and the value of the new article_id key must be the id corresponding to the original title value provided', () => {
    const actual = formatComments(input, refObj)[0];
    expect(actual.article_id).to.equal(1);
  });
  it('Should format a comment object so that its created_at value is converted into a javascript date object', () => {
    const actual = formatComments(input, refObj)[0];
    expect(actual.created_at).to.be.a('date');
  });
  it('Should keep the rest of the comment object properties the same', () => {
    const actual = formatComments(input, refObj)[0];
    expect(actual.body).to.eql(input[0].body);
    expect(actual.votes).to.eql(input[0].votes);
  });
  it('Should work as expected for multiple comment objects', () => {
    const actual = formatComments(input, refObj);
    actual.forEach((comment, index) => {
      expect(comment).to.have.keys([
        'author',
        'article_id',
        'created_at',
        'body',
        'votes'
      ]);
      expect(comment.author).to.equal(input[index].created_by);
      expect(comment.article_id).to.equal(refObj[input[index].belongs_to]);
      expect(comment.created_at).to.be.a('date');
      expect(comment.body).to.eql(input[index].body);
      expect(comment.votes).to.eql(input[index].votes);
    });
  });
});
