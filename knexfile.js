// Update with your config settings.

module.exports = {

  development: {
    client: 'mysql',
    connection: {
      filename: './dev.mysql'
    }
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'matchadb',
      user:     'root',
      password: '8aymdoc9'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'mysql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
