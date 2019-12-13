# **Northcoders News**

Northcoders News is a Node.js Express application featuring an intuitive REST API designed to access, manipulate and interact with users, topics, articles and comments.

You can view a hosted version [here](https://justjackjon-nc-news.herokuapp.com/api).

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

- **psql >= 10.10** - download for your platform [here](https://www.postgresql.org/download/).
- **git >= 2.17.1** - view multi-platform installation instructions [here](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git).
- **node >= 12.13.0 and npm >= 6.13.2** - download for your platform [here](https://nodejs.org/en/download/).

```bash
# EXAMPLES (for Linux):

# To install psql on Ubuntu you can run the following commands:
sudo apt update
sudo apt install postgresql postgresql-contrib

# To install git on a Debian-based distribution (such as Ubuntu):
sudo apt install git-all

# To install Node.js and npm on most popular Linux distributions you can use Snaps:
# Substitute '8' for the major version you want to install.
sudo snap install node --classic --channel=8
```

### Installing

A step by step series of examples that tell you how to get a development env running:

1. Clone this repo:

```bash
# Run the following CLI command:
git clone https://github.com/justJackjon/be-nc-news
```

2. Install required dependencies:

```bash
# Run the following CLI command:
npm install
```

3. Create a knexfile.js in the root directory and use the template code below:

```javascript
// place knexfile.js in the root directory

const { DB_URL } = process.env;
const ENV = process.env.NODE_ENV || 'development';

const baseConfig = {
  client: 'pg',
  migrations: {
    directory: './db/migrations'
  },
  seeds: {
    directory: './db/seeds'
  }
};

const customConfig = {
  production: {
    connection: `${DB_URL}?ssl=true`
  },
  development: {
    connection: {
      database: 'nc_news'
      // if using Linux enter your username and password below:
      // username: 'yourusername',
      // password: 'yourpassword'
    }
  },
  test: {
    connection: {
      database: 'nc_news_test'
      // if using Linux enter your username and password below:
      // username: 'yourusername',
      // password: 'yourpassword'
    }
  }
};

module.exports = { ...customConfig[ENV], ...baseConfig };
```

4. Test everything is working as expected:

```bash
# Setup the database seed with test data:
npm run seed-test

# Run the test suite:
npm test
```

5. Setup the database and seed with data:

```bash
npm run seed-dev
```

6. To run the server locally run the command:

```bash
npm start
# Use CTRL+C to stop
```

7. The server is now listening for requests.

```json
// EXAMPLE RESPONSE:
// When making a GET request to /api/articles/:article_id/comments
// Expect a response in the format below:

"comments": [
  {
    "comment_id": 44,
    "author": "grumpy19",
    "article_id": 1,
    "votes": 4,
    "created_at": "2017-11-20T08:58:48.322Z",
    "body": "Error est qui id corrupti et quod enim accusantium minus. Deleniti quae ea magni officiis et qui suscipit non."
  }
]
```

## Routes

For a list of available endpoints, their descriptions, available queries and example server responses, check the endpoints.json in the repo - or, when the server is up and listening for requests, make a GET request to '/api'.

## Built With

- [Express](https://expressjs.com/) - The back-end framework used
- [npm](https://www.npmjs.com/) - Dependency and Package Management
- [Knex.js](http://knexjs.org/) - An SQL Query Builder for Javascript
- [PostgreSQL](https://www.postgresql.org/) - The database used for this project

## Author

**John Butcher** - _Find my other projects on github at: 'justJackjon'_
