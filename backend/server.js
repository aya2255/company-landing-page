require("dotenv").config();

const express = require("express");
const cors = require("cors");
const {createClient} = require("@libsql/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.get("/api/user/profile", authenticateToken, async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
        SELECT id, name, email
        FROM users
        WHERE id = ?
      `,
      args: [req.user.id],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch user profile.",
    });
  }
});

app.put("/api/user/profile", authenticateToken, async (req, res) => {
  const { name } = req.body;

  // Backend validation
  if (!name || !name.trim()) {
    return res.status(400).json({
      error: "Name is required.",
    });
  }

  try {
    const result = await db.execute({
      sql: `
        UPDATE users
        SET name = ?
        WHERE id = ?
      `,
      args: [name.trim(), req.user.id],
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    // Return updated user data
    const updatedUser = await db.execute({
      sql: `
        SELECT id, name, email
        FROM users
        WHERE id = ?
      `,
      args: [req.user.id],
    });

    res.json({
      message: "Profile updated successfully!",
      user: updatedUser.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to update profile.",
    });
  }
});

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

  await db.execute(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )
`);
}

createTable();

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Access denied. Please login first.",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
    if (error) {
      return res.status(403).json({
        error: "Invalid or expired token.",
      });
    }

    req.user = user;
    next();
  });
}

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Backend validation
  if (!name || !email || !password) {
    return res.status(400).json({
      error: "Name, email and password are required.",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: "Please enter a valid email.",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: "Password must be at least 6 characters.",
    });
  }

  try {
    // Check if email already exists
    const existingUser = await db.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [email],
    });

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: "Email is already registered.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    await db.execute({
      sql: `
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
      `,
      args: [name, email, hashedPassword],
    });

    res.status(201).json({
      message: "Account created successfully!",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create account.",
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  // Backend validation
  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required.",
    });
  }

  try {
    // Find user
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE email = ?",
      args: [email],
    });

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    const user = result.rows[0];

    // Check password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Login failed.",
    });
  }
});

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Backend is running!" });
});

// Content API - Get all content
app.get("/api/content", authenticateToken ,async (req, res) => {
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
app.post("/api/content", authenticateToken, async (req, res) => {
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
app.put("/api/content/:id", authenticateToken , async (req, res) => {
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
app.delete("/api/content/:id", authenticateToken , async (req, res) => {
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