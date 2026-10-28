import mysql from 'mysql2/promise';
import { env } from './env.js';

// Create connection pool
export const pool = mysql.createPool({
  host: env.DB.HOST,
  port: env.DB.PORT,
  user: env.DB.USER,
  password: env.DB.PASSWORD,
  database: env.DB.NAME,
  waitForConnections: true,
  connectionLimit: env.DB.CONNECTION_LIMIT,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  decimalNumbers: true
});

/**
 * Execute parameterized query with clean error logging
 */
export async function query(sql, params = []) {
  try {
    const [rows, fields] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', {
      message: error.message,
      code: error.code,
      sql: sql.slice(0, 100)
    });
    throw error;
  }
}

/**
 * Execute a unit of work within a database transaction
 */
export async function withTransaction(workCallback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await workCallback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Test MySQL connection
 */
export async function testConnection() {
  try {
    const [result] = await pool.query('SELECT 1 AS connected, DATABASE() AS current_db');
    console.log(`Connected to MySQL database "${result[0].current_db}" successfully.`);
    return true;
  } catch (error) {
    console.error('Failed to connect to MySQL database:', error.message);
    return false;
  }
}

export default {
  pool,
  query,
  withTransaction,
  testConnection
};
