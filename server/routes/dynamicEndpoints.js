import express from "express";
import db from "../db.js";

const router = express.Router();

// This middleware will handle all dynamic mock endpoints
router.use("*", async (req, res, next) => {
  try {
    // Get the path from the request
    const requestPath = req.originalUrl;

    // Search for a matching endpoint in the database
    const result = await db.execute({
      sql: "SELECT * FROM endpoints WHERE path = ?",
      args: [requestPath],
    });

    // If no matching endpoint is found, continue to the next middleware/route
    if (result.rows.length === 0) {
      return next();
    }

    // Return the mock response
    const endpoint = result.rows[0];
    const mockResponse = JSON.parse(endpoint.response);

    res.json(mockResponse);
  } catch (error) {
    console.error("Error serving mock endpoint:", error);
    res.status(500).json({ error: "Failed to serve mock endpoint" });
  }
});

export default router;
