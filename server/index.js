import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import endpointRoutes from "./routes/endpoints.js";
import dynamicEndpoints from "./routes/dynamicEndpoints.js";
import userRoutes from "./routes/users.js";
import db from "./db.js";
import process from "process";

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3021;

// Initialize database schema
async function initializeDatabase() {
  try {
    // Read schema file
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = await fs.readFile(schemaPath, "utf8");

    // Split schema into individual statements
    const statements = schema
      .split(";")
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0);

    // Execute each statement
    for (const statement of statements) {
      await db.execute(statement + ";");
    }

    console.log("Database schema initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database schema:", error);
    process.exit(1);
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Check database connection
app.use(async (req, res, next) => {
  try {
    // Simple query to test the connection
    await db.execute("SELECT 1");
    next();
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// API routes
app.use("/", endpointRoutes);
app.use("/", userRoutes);

// Dynamic endpoint handler should be registered last
app.use("/", dynamicEndpoints);

// Start the server
async function startServer() {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
