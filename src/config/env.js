import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MYSQL_HOST: z.string().min(1).default("127.0.0.1"),
  MYSQL_PORT: z.coerce.number().int().positive().default(3306),
  MYSQL_USER: z.string().min(1),
  MYSQL_PASSWORD: z.string().default(""),
  MYSQL_DATABASE: z.string().min(1),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().min(1).default("7d"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:");
  for (const issue of parsed.error.issues) {
    console.error(`- ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

if (parsed.data.JWT_SECRET === "replace-with-a-long-random-string") {
  console.error("JWT_SECRET is still the placeholder from .env.example. Set a real secret of at least 32 characters.");
  process.exit(1);
}

export const env = parsed.data;
