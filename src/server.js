import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectMongo } from "./config/mongo.js";
import { checkMysql } from "./config/mysql.js";

async function start() {
  try {
    await connectMongo();
    await checkMysql();
  } catch (error) {
    console.error("Failed to connect to a database.");
    console.error(error.message);
    process.exit(1);
  }

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
  });

  server.on("error", (error) => {
    console.error(error.message);
    process.exit(1);
  });
}

start();
