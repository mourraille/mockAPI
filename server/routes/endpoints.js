import express from "express";
import db from "../db.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Get all endpoints
router.get("/endpoints", async (req, res) => {
  try {
    const result = await db.execute(
      "SELECT * FROM endpoints ORDER BY created_at DESC"
    );

    // Map the response data to match your current format
    const endpoints = result.rows.map((endpoint) => ({
      id: endpoint.id,
      path: endpoint.path,
      response: JSON.parse(endpoint.response),
      created_at: endpoint.created_at,
      updated_at: endpoint.updated_at,
    }));

    res.json(endpoints);
  } catch (error) {
    console.error("Error fetching endpoints:", error);
    res.status(500).json({ error: "Failed to fetch endpoints" });
  }
});

// Create a new mock endpoint
router.post("/create-mock", async (req, res) => {
  try {
    const { apiPath, mockResponse } = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();

    await db.execute({
      sql: "INSERT INTO endpoints (id, path, response, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
      args: [id, apiPath, JSON.stringify(mockResponse), now, now],
    });

    res.status(201).json({
      id,
      message: "Mock endpoint created successfully",
    });
  } catch (error) {
    console.error("Error creating mock endpoint:", error);
    res.status(500).json({ error: "Failed to create mock endpoint" });
  }
});

// Update an existing mock endpoint
router.put("/update-mock/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { apiPath, mockResponse } = req.body;
    const now = new Date().toISOString();

    const result = await db.execute({
      sql: "UPDATE endpoints SET path = ?, response = ?, updated_at = ? WHERE id = ?",
      args: [apiPath, JSON.stringify(mockResponse), now, id],
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Endpoint not found" });
    }

    res.json({ message: "Mock endpoint updated successfully" });
  } catch (error) {
    console.error("Error updating mock endpoint:", error);
    res.status(500).json({ error: "Failed to update mock endpoint" });
  }
});

// Delete a mock endpoint
router.delete("/delete-mock/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.execute({
      sql: "DELETE FROM endpoints WHERE id = ?",
      args: [id],
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Endpoint not found" });
    }

    res.json({ message: "Mock endpoint deleted successfully" });
  } catch (error) {
    console.error("Error deleting mock endpoint:", error);
    res.status(500).json({ error: "Failed to delete mock endpoint" });
  }
});

export default router;
