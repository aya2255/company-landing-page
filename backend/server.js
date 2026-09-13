require("dotenv").config();

const express = require("express");
const cors = require("cors");
const {createClient} = require("@libsql/client");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function createTable() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL
    )
  `);
}

createTable();

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Backend is running!" });
});

// Content API - Get all content
app.get("/api/content", async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT * FROM content
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch content.",
    });
  }
});

// Content API - Add new content
app.post("/api/content", async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      error: "Title and description are required.",
    });
  }

  try {
    const result = await db.execute({
      sql: `
        INSERT INTO content (title, description)
        VALUES (?, ?)
      `,
      args: [title, description],
    });

    res.status(201).json({
      message: "Content added successfully!",
      id: Number(result.lastInsertRowid),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to add content.",
    });
  }
});

// Content API - Update content
app.put("/api/content/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      error: "Title and description are required.",
    });
  }

  try {
    const result = await db.execute({
      sql: `
        UPDATE content
        SET title = ?, description = ?
        WHERE id = ?
      `,
      args: [title, description, id],
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        error: "Content not found.",
      });
    }

    res.json({
      message: "Content updated successfully!",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to update content.",
    });
  }
});

// Content API - Delete content
app.delete("/api/content/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.execute({
      sql: `
        DELETE FROM content
        WHERE id = ?
      `,
      args: [id],
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        error: "Content not found.",
      });
    }

    res.json({
      message: "Content deleted successfully!",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to delete content.",
    });
  }
});

// Contact API
app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      error: "All fields are required."
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: "Please enter a valid email."
    });
  }

  // Store inquiry
await db.execute({
  sql: `
    INSERT INTO inquiries (name, email, subject, message)
    VALUES (?, ?, ?, ?)
  `,
  args: [name, email, subject, message],
});

res.status(201).json({
  message: "Your message has been sent successfully!",
});
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});