const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database
const db = new Database("contact.db");

db.prepare(`
  CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL
  )
`).run();

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Backend is running!" });
});

// Contact API
app.post("/api/contact", (req, res) => {
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
  const insert = db.prepare(`
    INSERT INTO inquiries (name, email, subject, message)
    VALUES (?, ?, ?, ?)
  `);

  insert.run(name, email, subject, message);

  res.status(201).json({
    message: "Your message has been sent successfully!"
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});