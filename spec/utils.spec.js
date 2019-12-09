const { expect } = require('chai');
const {
  formatDates,
  makeRefObj,
  formatComments
} = require('../db/utils/utils');

describe('formatDates', () => {
  it('Should be able to take an array (list) of objects and return a new array', () => {
    expect(formatDates([{}, {}, {}])).to.be.an('array');
  });
  it('Should not mutate the argument array', () => {
    const input = [{}, {}, {}];
    expect(formatDates(input)).to.not.eql(input);
  });
  it('An item in the new array must have its timestamp converted into a Javascript date object', () => {
    const input = [
      {
        title: 'Living in the shadow of a great man',
        topic: 'mitch',
        author: 'butter_bridge',
        body: 'I find this existence challenging',
        created_at: 1542284514171,
        votes: 100
      }
    ];
    const actual = formatDates(input);
    expect(actual[0].created_at).to.be.a('date');
  });
  it('Everything else in the item must be maintained', () => {
    const input = [
      {
        title: 'Living in the shadow of a great man',
        topic: 'mitch',
        author: 'butter_bridge',
        body: 'I find this existence challenging',
        created_at: 1542284514171,
        votes: 100
      }
    ];
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
    const actual = formatDates(input);
    actual.forEach(object => {
      expect(object.created_at).to.be.a('date');
    });
  });
});

describe('makeRefObj', () => {});

describe('formatComments', () => {});
