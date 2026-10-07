require("dotenv").config();

const express = require("express");
const cors = require("cors");
const {createClient} = require("@libsql/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + file.originalname;

    cb(null, uniqueName);
  },
});

const allowedMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/jpeg",
  "image/png",
];

const upload = multer({
  storage: storage,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },

  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, DOC, DOCX, TXT, JPG, and PNG files are allowed."));
    }
  },
});

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
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer'
  )
`);

try {
  await db.execute(`
    ALTER TABLE users
    ADD COLUMN role TEXT NOT NULL DEFAULT 'customer'
  `);
} catch (error) {
  // Column already exists
}

await db.execute(`
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL
  )
`);

await db.execute(`
  CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    details TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

await db.execute(`
  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    original_name TEXT NOT NULL,
    filename TEXT NOT NULL,
    mimetype TEXT NOT NULL,
    size INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

await db.execute(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    company TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

await db.execute(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Not Started',
    progress INTEGER NOT NULL DEFAULT 0,
    client_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

await db.execute(`
  CREATE TABLE IF NOT EXISTS project_members (
    project_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    PRIMARY KEY (project_id, user_id)
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

function authorize(...requiredPermissions) {
  return (req, res, next) => {
    const role = req.user.role;

const permissions = {
  admin: [
    "content:read",
    "content:create",
    "content:update",
    "content:delete",

    "service:read",
    "service:create",
    "service:update",
    "service:delete",

    "request:read",
    "request:create",
    "request:update",

    "client:read",
    "client:create",
    "client:update",
    "client:delete",

    "project:read",
    "project:create",
    "project:update",
    "project:delete",
    "project:assign",
  ],

  employee: [
    "service:read",

    "request:read",
    "request:update",

    "project:read",
    "project:update",
  ],

  customer: [
    "service:read",
    "request:create",
  ],
};

    const userPermissions = permissions[role] || [];

    const hasPermission = requiredPermissions.every(
      (permission) =>
        userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        error: "You do not have permission to perform this action.",
      });
    }

    next();
  };
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
    role: user.role,
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
  role: user.role,
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
app.get(
  "/api/content",
  authenticateToken,
  authorize("content:read"),
  async (req, res) => {
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
app.post(
  "/api/content",
  authenticateToken,
  authorize("content:create"),
  async (req, res) => {
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
 app.put(
  "/api/content/:id",
  authenticateToken,
  authorize("content:update"),
  async (req, res) => {
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
app.delete(
  "/api/content/:id",
  authenticateToken,
  authorize("content:delete"),
  async (req, res) => {
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

app.get("/api/services", async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT id, title, description
      FROM services
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch services.",
    });
  }
});

app.post(
  "/api/services",
  authenticateToken,
  authorize("service:create"),
  async (req, res) => {
  const { title, description } = req.body;

  // Backend validation
  if (!title || !title.trim() || !description || !description.trim()) {
    return res.status(400).json({
      error: "Title and description are required.",
    });
  }

  try {
    const result = await db.execute({
      sql: `
        INSERT INTO services (title, description)
        VALUES (?, ?)
      `,
      args: [title.trim(), description.trim()],
    });

    res.status(201).json({
      message: "Service created successfully!",
      service: {
        id: Number(result.lastInsertRowid),
        title: title.trim(),
        description: description.trim(),
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create service.",
    });
  }
});

app.put(
  "/api/services/:id",
  authenticateToken,
  authorize("service:update"),
  async (req, res) => {
  const { title, description } = req.body;
  const { id } = req.params;

  if (!title || !title.trim() || !description || !description.trim()) {
    return res.status(400).json({
      error: "Title and description are required.",
    });
  }

  try {
    const result = await db.execute({
      sql: `
        UPDATE services
        SET title = ?, description = ?
        WHERE id = ?
      `,
      args: [title.trim(), description.trim(), id],
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        error: "Service not found.",
      });
    }

    res.json({
      message: "Service updated successfully!",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to update service.",
    });
  }
});

app.delete(
  "/api/services/:id",
  authenticateToken,
  authorize("service:delete"),
  async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.execute({
      sql: "DELETE FROM services WHERE id = ?",
      args: [id],
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        error: "Service not found.",
      });
    }

    res.json({
      message: "Service deleted successfully!",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to delete service.",
    });
  }
});

app.post(
  "/api/requests",
  authenticateToken,
  authorize("request:create"),
  async (req, res) => {
  const { service_id, details } = req.body;

  if (!service_id || !details || !details.trim()) {
    return res.status(400).json({
      error: "Service and details are required.",
    });
  }

  try {
    const service = await db.execute({
      sql: "SELECT id FROM services WHERE id = ?",
      args: [service_id],
    });

    if (service.rows.length === 0) {
      return res.status(404).json({
        error: "Service not found.",
      });
    }

    const result = await db.execute({
      sql: `
        INSERT INTO requests (user_id, service_id, details)
        VALUES (?, ?, ?)
      `,
      args: [req.user.id, service_id, details.trim()],
    });

    res.status(201).json({
      message: "Request submitted successfully!",
      request: {
        id: Number(result.lastInsertRowid),
        service_id,
        details: details.trim(),
        status: "Pending",
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to submit request.",
    });
  }
});

app.get(
  "/api/requests",
  authenticateToken,
  authorize("request:read"),
  async (req, res) => {
  const { search, status, service_id } = req.query;

  try {
    let sql = `
      SELECT
        requests.id,
        requests.details,
        requests.status,
        requests.created_at,
        users.name AS customer_name,
        users.email AS customer_email,
        services.title AS service_title
      FROM requests
      JOIN users ON requests.user_id = users.id
      JOIN services ON requests.service_id = services.id
      WHERE 1 = 1
    `;

    const args = [];

    // Search
    if (search && search.trim()) {
      sql += `
        AND (
          users.name LIKE ?
          OR users.email LIKE ?
          OR services.title LIKE ?
          OR requests.details LIKE ?
        )
      `;

      const searchValue = `%${search.trim()}%`;

      args.push(
        searchValue,
        searchValue,
        searchValue,
        searchValue
      );
    }

    // Filter by status
    if (status && status !== "All") {
      sql += ` AND requests.status = ?`;
      args.push(status);
    }

    // Filter by service
    if (service_id && service_id !== "All") {
      sql += ` AND requests.service_id = ?`;
      args.push(service_id);
    }

    sql += ` ORDER BY requests.id DESC`;

    const result = await db.execute({
      sql,
      args,
    });

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch requests.",
    });
  }
});

app.get(
  "/api/requests/:id",
  authenticateToken,
  authorize("request:read"),
  async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.execute({
      sql: `
        SELECT
          requests.id,
          requests.details,
          requests.status,
          requests.created_at,
          users.name AS customer_name,
          users.email AS customer_email,
          services.title AS service_title
        FROM requests
        JOIN users ON requests.user_id = users.id
        JOIN services ON requests.service_id = services.id
        WHERE requests.id = ?
      `,
      args: [id],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Request not found.",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch request.",
    });
  }
});

app.put(
  "/api/requests/:id/status",
  authenticateToken,
  authorize("request:update"),
  async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = [
    "Pending",
    "In Progress",
    "Completed",
    "Rejected",
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      error: "Invalid status.",
    });
  }

  try {
    const result = await db.execute({
      sql: `
        UPDATE requests
        SET status = ?
        WHERE id = ?
      `,
      args: [status, id],
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        error: "Request not found.",
      });
    }

    res.json({
      message: "Request status updated successfully!",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to update request status.",
    });
  }
});

app.post(
  "/api/files",
  authenticateToken,
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            error: "File is too large. Maximum size is 5 MB.",
          });
        }

        return res.status(400).json({
          error: "File upload failed.",
        });
      }

      if (err) {
        return res.status(400).json({
          error: err.message,
        });
      }

      next();
    });
  },

  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        error: "Please select a file.",
      });
    }

    try {
      const result = await db.execute({
        sql: `
          INSERT INTO files
          (user_id, original_name, filename, mimetype, size)
          VALUES (?, ?, ?, ?, ?)
        `,
        args: [
          req.user.id,
          req.file.originalname,
          req.file.filename,
          req.file.mimetype,
          req.file.size,
        ],
      });

      res.status(201).json({
        message: "File uploaded successfully!",
        file: {
          id: Number(result.lastInsertRowid),
          original_name: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        },
      });
    } catch (error) {
      console.error(error);

      if (req.file) {
        fs.unlink(
          path.join(uploadDir, req.file.filename),
          () => {}
        );
      }

      res.status(500).json({
        error: "Failed to save file information.",
      });
    }
  }
);

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File is too large. Maximum size is 5 MB.",
      });
    }

    return res.status(400).json({
      error: "File upload failed.",
    });
  }

  if (error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  next();
});

app.get(
  "/api/files",
  authenticateToken,
  async (req, res) => {
    try {
      const result = await db.execute({
        sql: `
          SELECT
            id,
            original_name,
            mimetype,
            size,
            created_at
          FROM files
          WHERE user_id = ?
          ORDER BY created_at DESC
        `,
        args: [req.user.id],
      });

      res.json(result.rows);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to fetch files.",
      });
    }
  }
);

app.delete(
  "/api/files/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const result = await db.execute({
        sql: `
          SELECT filename
          FROM files
          WHERE id = ? AND user_id = ?
        `,
        args: [req.params.id, req.user.id],
      });

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "File not found.",
        });
      }

      const filename = result.rows[0].filename;

      await db.execute({
        sql: `
          DELETE FROM files
          WHERE id = ? AND user_id = ?
        `,
        args: [req.params.id, req.user.id],
      });

      const filePath = path.join(uploadDir, filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      res.json({
        message: "File deleted successfully!",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to delete file.",
      });
    }
  }
);

// =========================
// CLIENT MANAGEMENT
// =========================

// Get all clients
app.get(
  "/api/clients",
  authenticateToken,
  authorize("client:read"),
  async (req, res) => {
    try {
      const result = await db.execute(`
        SELECT *
        FROM clients
        ORDER BY id DESC
      `);

      res.json(result.rows);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to fetch clients.",
      });
    }
  }
);


// Create client
app.post(
  "/api/clients",
  authenticateToken,
  authorize("client:create"),
  async (req, res) => {
    const { name, email, company } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: "Client name is required.",
      });
    }

    try {
      const result = await db.execute({
        sql: `
          INSERT INTO clients (name, email, company)
          VALUES (?, ?, ?)
        `,
        args: [
          name.trim(),
          email || null,
          company || null,
        ],
      });

      res.status(201).json({
        message: "Client created successfully!",
        id: Number(result.lastInsertRowid),
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to create client.",
      });
    }
  }
);


// Update client
app.put(
  "/api/clients/:id",
  authenticateToken,
  authorize("client:update"),
  async (req, res) => {
    const { name, email, company } = req.body;
    const { id } = req.params;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: "Client name is required.",
      });
    }

    try {
      const result = await db.execute({
        sql: `
          UPDATE clients
          SET name = ?, email = ?, company = ?
          WHERE id = ?
        `,
        args: [
          name.trim(),
          email || null,
          company || null,
          id,
        ],
      });

      if (result.rowsAffected === 0) {
        return res.status(404).json({
          error: "Client not found.",
        });
      }

      res.json({
        message: "Client updated successfully!",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to update client.",
      });
    }
  }
);


// Delete client
app.delete(
  "/api/clients/:id",
  authenticateToken,
  authorize("client:delete"),
  async (req, res) => {
    const { id } = req.params;

    try {
      // Check if client has projects
      const projects = await db.execute({
        sql: `
          SELECT id
          FROM projects
          WHERE client_id = ?
        `,
        args: [id],
      });

      if (projects.rows.length > 0) {
        return res.status(400).json({
          error: "Cannot delete a client that has projects.",
        });
      }

      const result = await db.execute({
        sql: `
          DELETE FROM clients
          WHERE id = ?
        `,
        args: [id],
      });

      if (result.rowsAffected === 0) {
        return res.status(404).json({
          error: "Client not found.",
        });
      }

      res.json({
        message: "Client deleted successfully!",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to delete client.",
      });
    }
  }
);


// =========================
// PROJECT MANAGEMENT
// =========================

// Get projects
app.get(
  "/api/projects",
  authenticateToken,
  authorize("project:read"),
  async (req, res) => {
    try {
      let result;

      if (req.user.role === "admin") {
        // Admin can see all projects
        result = await db.execute(`
          SELECT
            p.id,
            p.name,
            p.description,
            p.status,
            p.progress,
            p.client_id,
            c.name AS client_name,
            c.company AS client_company,
            p.created_at
          FROM projects p
          JOIN clients c ON p.client_id = c.id
          ORDER BY p.id DESC
        `);
      } else {
        // Employee can only see projects assigned to them
        result = await db.execute({
          sql: `
            SELECT
              p.id,
              p.name,
              p.description,
              p.status,
              p.progress,
              p.client_id,
              c.name AS client_name,
              c.company AS client_company,
              p.created_at
            FROM projects p
            JOIN clients c ON p.client_id = c.id
            JOIN project_members pm
              ON p.id = pm.project_id
            WHERE pm.user_id = ?
            ORDER BY p.id DESC
          `,
          args: [req.user.id],
        });
      }

      // Get assigned members for every project
      const projects = [];

      for (const project of result.rows) {
        const members = await db.execute({
          sql: `
            SELECT
              u.id,
              u.name,
              u.email
            FROM users u
            JOIN project_members pm
              ON u.id = pm.user_id
            WHERE pm.project_id = ?
          `,
          args: [project.id],
        });

        projects.push({
          ...project,
          members: members.rows,
        });
      }

      res.json(projects);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to fetch projects.",
      });
    }
  }
);

// Create project
app.post(
  "/api/projects",
  authenticateToken,
  authorize("project:create"),
  async (req, res) => {
    const {
      name,
      description,
      status,
      progress,
      client_id,
      member_ids,
    } = req.body;

    const allowedStatuses = [
      "Not Started",
      "In Progress",
      "Completed",
      "On Hold",
    ];

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: "Project name is required.",
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        error: "Project description is required.",
      });
    }

    if (!client_id) {
      return res.status(400).json({
        error: "Client is required.",
      });
    }

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid project status.",
      });
    }

    const projectProgress =
      progress === undefined ? 0 : Number(progress);

    if (
      !Number.isInteger(projectProgress) ||
      projectProgress < 0 ||
      projectProgress > 100
    ) {
      return res.status(400).json({
        error: "Progress must be an integer between 0 and 100.",
      });
    }

    try {
      // Check client exists
      const client = await db.execute({
        sql: `
          SELECT id
          FROM clients
          WHERE id = ?
        `,
        args: [client_id],
      });

      if (client.rows.length === 0) {
        return res.status(404).json({
          error: "Client not found.",
        });
      }

      // Create project
      const result = await db.execute({
        sql: `
          INSERT INTO projects
          (name, description, status, progress, client_id)
          VALUES (?, ?, ?, ?, ?)
        `,
        args: [
          name.trim(),
          description.trim(),
          status || "Not Started",
          projectProgress,
          client_id,
        ],
      });

      const projectId = Number(result.lastInsertRowid);

      // Assign team members
      if (Array.isArray(member_ids)) {
        for (const userId of member_ids) {
          const employee = await db.execute({
            sql: `
              SELECT id
              FROM users
              WHERE id = ?
              AND role = 'employee'
            `,
            args: [userId],
          });

          if (employee.rows.length > 0) {
            await db.execute({
              sql: `
                INSERT OR IGNORE INTO project_members
                (project_id, user_id)
                VALUES (?, ?)
              `,
              args: [projectId, userId],
            });
          }
        }
      }

      res.status(201).json({
        message: "Project created successfully!",
        project_id: projectId,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to create project.",
      });
    }
  }
);

// Update project
app.put(
  "/api/projects/:id",
  authenticateToken,
  authorize("project:update"),
  async (req, res) => {
    const { id } = req.params;
    const {
      name,
      description,
      status,
      progress,
      client_id,
      member_ids,
    } = req.body;

    const allowedStatuses = [
      "Not Started",
      "In Progress",
      "Completed",
      "On Hold",
    ];

    try {
      // Check if project exists
      const projectResult = await db.execute({
        sql: `
          SELECT *
          FROM projects
          WHERE id = ?
        `,
        args: [id],
      });

      if (projectResult.rows.length === 0) {
        return res.status(404).json({
          error: "Project not found.",
        });
      }

      const project = projectResult.rows[0];

      // =========================
      // EMPLOYEE
      // =========================
      if (req.user.role === "employee") {
        // Check that employee is assigned to this project
        const memberResult = await db.execute({
          sql: `
            SELECT *
            FROM project_members
            WHERE project_id = ?
            AND user_id = ?
          `,
          args: [id, req.user.id],
        });

        if (memberResult.rows.length === 0) {
          return res.status(403).json({
            error: "You are not assigned to this project.",
          });
        }

        // Employee can only update status and progress
        if (!allowedStatuses.includes(status)) {
          return res.status(400).json({
            error: "Invalid project status.",
          });
        }

        const projectProgress = Number(progress);

        if (
          !Number.isInteger(projectProgress) ||
          projectProgress < 0 ||
          projectProgress > 100
        ) {
          return res.status(400).json({
            error: "Progress must be an integer between 0 and 100.",
          });
        }

        await db.execute({
          sql: `
            UPDATE projects
            SET status = ?, progress = ?
            WHERE id = ?
          `,
          args: [status, projectProgress, id],
        });

        return res.json({
          message: "Project status and progress updated successfully!",
        });
      }

      // =========================
      // ADMIN
      // =========================

      if (!name || !name.trim()) {
        return res.status(400).json({
          error: "Project name is required.",
        });
      }

      if (!description || !description.trim()) {
        return res.status(400).json({
          error: "Project description is required.",
        });
      }

      if (!client_id) {
        return res.status(400).json({
          error: "Client is required.",
        });
      }

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          error: "Invalid project status.",
        });
      }

      const projectProgress = Number(progress);

      if (
        !Number.isInteger(projectProgress) ||
        projectProgress < 0 ||
        projectProgress > 100
      ) {
        return res.status(400).json({
          error: "Progress must be an integer between 0 and 100.",
        });
      }

      // Check client
      const clientResult = await db.execute({
        sql: `
          SELECT id
          FROM clients
          WHERE id = ?
        `,
        args: [client_id],
      });

      if (clientResult.rows.length === 0) {
        return res.status(404).json({
          error: "Client not found.",
        });
      }

      // Update project
      await db.execute({
        sql: `
          UPDATE projects
          SET
            name = ?,
            description = ?,
            status = ?,
            progress = ?,
            client_id = ?
          WHERE id = ?
        `,
        args: [
          name.trim(),
          description.trim(),
          status,
          projectProgress,
          client_id,
          id,
        ],
      });

      // Update assigned members
      if (Array.isArray(member_ids)) {
        await db.execute({
          sql: `
            DELETE FROM project_members
            WHERE project_id = ?
          `,
          args: [id],
        });

        for (const userId of member_ids) {
          const employee = await db.execute({
            sql: `
              SELECT id
              FROM users
              WHERE id = ?
              AND role = 'employee'
            `,
            args: [userId],
          });

          if (employee.rows.length > 0) {
            await db.execute({
              sql: `
                INSERT OR IGNORE INTO project_members
                (project_id, user_id)
                VALUES (?, ?)
              `,
              args: [id, userId],
            });
          }
        }
      }

      res.json({
        message: "Project updated successfully!",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to update project.",
      });
    }
  }
);

// Delete project
app.delete(
  "/api/projects/:id",
  authenticateToken,
  authorize("project:delete"),
  async (req, res) => {
    const { id } = req.params;

    try {
      // Check if project exists
      const projectResult = await db.execute({
        sql: `
          SELECT id
          FROM projects
          WHERE id = ?
        `,
        args: [id],
      });

      if (projectResult.rows.length === 0) {
        return res.status(404).json({
          error: "Project not found.",
        });
      }

      // Remove project members first
      await db.execute({
        sql: `
          DELETE FROM project_members
          WHERE project_id = ?
        `,
        args: [id],
      });

      // Delete project
      await db.execute({
        sql: `
          DELETE FROM projects
          WHERE id = ?
        `,
        args: [id],
      });

      res.json({
        message: "Project deleted successfully!",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to delete project.",
      });
    }
  }
);

// =========================
// TEAM MEMBERS
// =========================

app.get(
  "/api/users/team-members",
  authenticateToken,
  authorize("project:assign"),
  async (req, res) => {
    try {
      const result = await db.execute(`
        SELECT id, name, email
        FROM users
        WHERE role = 'employee'
        ORDER BY name ASC
      `);

      res.json(result.rows);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to fetch team members.",
      });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});