const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'database-1.ctqllx5pl3kk.ap-south-1.rds.amazonaws.com', // Updated RDS endpoint
  user: 'admin', // Username (ensure this user has appropriate permissions)
  password: 'rootroot', // Updated password
  database: 'ecommerce_db', // Your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
