module.exports = {
  port: 80,
  mysql: {
    connection_string: process.env.MYSQL_CONNECTION_STRING,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    logging: console.log,
    max_concurent_queries: 200,
    pool: {
      maxConnections: 20,
      maxIdleTime: 30
    }
  }
};
