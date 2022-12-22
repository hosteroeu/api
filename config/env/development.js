module.exports = {
  mysql: {
    connection_string: '',
    host: '',
    user: '',
    password: '',
    database: 'apiproduction',
    logging: console.log,
    max_concurent_queries: 200,
    pool: {
      maxConnections: 20,
      maxIdleTime: 30
    }
  }
};
