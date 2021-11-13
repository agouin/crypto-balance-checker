// Update with your config settings.
const { DB_CONNECTION } = require('./config/development.json')

module.exports = {
  development: {
    client: 'postgresql',
    connection: DB_CONNECTION,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'migrations',
      directory: 'db/migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: DB_CONNECTION,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'migrations',
      directory: 'db/migrations'
    }
  }

};
