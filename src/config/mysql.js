import mysql from "mysql2/promise";
import { env } from "./env.js";

export const pool = mysql.createPool({
  host: env.MYSQL_HOST,
  port: env.MYSQL_PORT,
  user: env.MYSQL_USER,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  timezone: "Z",
});

export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export async function checkMysql() {
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.query("SELECT 1");
    const [tables] = await connection.query(
      `SELECT COUNT(*) AS tableCount
       FROM information_schema.tables
       WHERE table_schema = ? AND table_name IN ('users', 'projects')`,
      [env.MYSQL_DATABASE]
    );

    if (Number(tables[0].tableCount) < 2) {
      throw new Error("MySQL tables are missing. Run: pnpm db:setup");
    }
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      throw new Error(
        `Cannot reach MySQL at ${env.MYSQL_HOST}:${env.MYSQL_PORT}. Install and start MySQL, then run pnpm db:setup.`
      );
    }
    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      throw new Error("MySQL rejected the username or password in .env.");
    }
    if (error.code === "ER_BAD_DB_ERROR") {
      throw new Error(`MySQL database "${env.MYSQL_DATABASE}" does not exist. Run: pnpm db:setup`);
    }
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
