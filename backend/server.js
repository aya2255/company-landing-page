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
}

createTable();

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Backend is running!" });
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