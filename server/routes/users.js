import express from "express";
import db from "../db.js";

const router = express.Router();

// Register or update a user
router.post("/users", async (req, res) => {
  try {
    const { uid, email, displayName, photoURL, provider } = req.body;

    if (!uid || !email || !provider) {
      return res
        .status(400)
        .json({ error: "Missing required user information" });
    }

    const now = new Date().toISOString();

    // Check if user already exists
    const userResult = await db.execute({
      sql: "SELECT * FROM users WHERE uid = ?",
      args: [uid],
    });

    if (userResult.rows.length === 0) {
      // Create new user
      await db.execute({
        sql: "INSERT INTO users (uid, email, display_name, photo_url, provider, last_login, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: [
          uid,
          email,
          displayName || null,
          photoURL || null,
          provider,
          now,
          now,
        ],
      });

      res.status(201).json({ message: "User created successfully" });
    } else {
      // Update existing user
      await db.execute({
        sql: "UPDATE users SET email = ?, display_name = ?, photo_url = ?, provider = ?, last_login = ? WHERE uid = ?",
        args: [
          email,
          displayName || null,
          photoURL || null,
          provider,
          now,
          uid,
        ],
      });

      res.status(200).json({ message: "User updated successfully" });
    }
  } catch (error) {
    console.error("Error managing user:", error);
    res.status(500).json({ error: "Failed to register/update user" });
  }
});

// Get user by ID
router.get("/users/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    const result = await db.execute({
      sql: "SELECT * FROM users WHERE uid = ?",
      args: [uid],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

export default router;
