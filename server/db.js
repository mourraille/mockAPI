import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import process from "process";

// Load environment variables from server directory
dotenv.config();

// Check for required environment variables
if (!process.env.TURSO_DATABASE_URL) {
  console.error("ERROR: TURSO_DATABASE_URL is not defined in your .env file");
  process.exit(1);
}

if (!process.env.TURSO_AUTH_TOKEN) {
  console.error("ERROR: TURSO_AUTH_TOKEN is not defined in your .env file");
  process.exit(1);
}

// Create and export the Turso client
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default db;
