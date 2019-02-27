require('dotenv').config();

module.exports = {
  client: 'pg',
  connection: {
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    directory: __dirname + '/database/migrations',
    tableName: 'knex_migrations'
  },
  seeds: {
    directory: __dirname + '/database/seeds'
  }
};
