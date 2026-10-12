import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, "..", "database", "schema.sql");
const schemaSql = fs.readFileSync(schemaPath, "utf8");

const host = process.env.MYSQL_HOST || "127.0.0.1";
const port = Number(process.env.MYSQL_PORT || 3306);
const user = process.env.MYSQL_USER || "root";
const password = process.env.MYSQL_PASSWORD ?? "";

if (!process.env.MYSQL_USER) {
  console.error("MYSQL_USER is missing. Copy .env.example to .env and set the MySQL values.");
  process.exit(1);
}

let connection;

try {
  connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true,
  });
  await connection.query(schemaSql);
  console.log("MySQL schema is ready in database project_task_db.");
} catch (error) {
  if (error.code === "ECONNREFUSED") {
    console.error(`Cannot reach MySQL at ${host}:${port}. Start MySQL, then run pnpm db:setup again.`);
  } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
    console.error("MySQL rejected MYSQL_USER or MYSQL_PASSWORD from .env.");
  } else {
    console.error(error.message);
  }
  process.exit(1);
} finally {
  if (connection) {
    await connection.end();
  }
}
