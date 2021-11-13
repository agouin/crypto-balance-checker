const { DB_CONNECTION } = require('./config/development.json')

module.exports = require('knex')({
    client: 'pg',
    connection: DB_CONNECTION,
    migrations: {
        tableName: 'migrations',
        directory: 'db/migrations'
    }
})