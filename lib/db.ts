import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'icognito.ai',
  // host: 'localhost',
  user: 'iicl',
  // user: 'root',
  password: 'IiclIndia@123',
  // password: '',
  database: 'lex_genie',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool; 