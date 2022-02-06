import 'ts-node/register';
const DB_URL = '';

export default {
  development: {
    client: 'postgresql',
    connection: DB_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: __dirname + '/migrations',
    },
    useNullAsDefault: true,
  },

  production: {
    client: 'postgresql',
    connection: DB_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: __dirname + '/migrations',
    },
  },
};
