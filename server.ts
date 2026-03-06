import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";

const app = express();
const PORT = 3000;
const JWT_SECRET = "sireknaker-secret-key-2024";

// Database Initialization
const db = new Database("database.db");
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nik TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    nama TEXT,
    tempat_lahir TEXT,
    tanggal_lahir TEXT,
    umur INTEGER,
    no_hp TEXT,
    email TEXT,
    jenis_kelamin TEXT,
    agama TEXT,
    status_perkawinan TEXT,
    pendidikan TEXT,
    jurusan TEXT,
    alamat_kampung TEXT,
    rt TEXT,
    rw TEXT,
    desa TEXT,
    kecamatan TEXT,
    kabupaten TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    ijazah TEXT,
    kk TEXT,
    ktp TEXT,
    surat_kuning TEXT,
    npwp TEXT,
    skck TEXT,
    lamaran TEXT,
    pas_foto TEXT,
    status_berkas TEXT DEFAULT 'TIDAK LENGKAP',
    progress_stage TEXT DEFAULT 'BELUM DIMULAI',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Handle existing databases that might miss the progress_stage column
try {
  db.exec("ALTER TABLE documents ADD COLUMN progress_stage TEXT DEFAULT 'BELUM DIMULAI'");
} catch (e) {
  // Column already exists
}

// Seed Admin if not exists or update password
const adminUser: any = db.prepare("SELECT id FROM users WHERE nik = 'admin'").get();
const hashedAdminPassword = bcrypt.hashSync("admin", 10);
if (!adminUser) {
  db.prepare("INSERT INTO users (nik, password, role, nama) VALUES (?, ?, ?, ?)").run("admin", hashedAdminPassword, "admin", "Administrator");
} else {
  db.prepare("UPDATE users SET password = ? WHERE nik = 'admin'").run(hashedAdminPassword);
}

// Middleware
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    req.user = user;
    next();
  });
};

// --- API ROUTES ---

// Auth
app.post("/api/register", async (req, res) => {
  const { nik, password, nama } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = db.prepare("INSERT INTO users (nik, password, nama) VALUES (?, ?, ?)").run(nik, hashedPassword, nama);
    db.prepare("INSERT INTO documents (user_id) VALUES (?)").run(result.lastInsertRowid);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error: any) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      res.status(400).json({ message: "NIK already registered" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
});

app.post("/api/login", async (req, res) => {
  const { nik, password } = req.body;
  const user: any = db.prepare("SELECT * FROM users WHERE nik = ?").get(nik);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid NIK or password" });
  }

  const token = jwt.sign({ id: user.id, nik: user.nik, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
  res.json({ token, user: { id: user.id, nik: user.nik, nama: user.nama, role: user.role } });
});

// User Profile
app.get("/api/profile", authenticateToken, (req: any, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  const docs = db.prepare("SELECT * FROM documents WHERE user_id = ?").get(req.user.id);
  res.json({ ...user, documents: docs });
});

app.put("/api/profile", authenticateToken, (req: any, res) => {
  const {
    nama, tempat_lahir, tanggal_lahir, no_hp, email, jenis_kelamin, agama,
    status_perkawinan, pendidikan, jurusan, alamat_kampung, rt, rw, desa, kecamatan, kabupaten
  } = req.body;

  // Calculate Age
  let umur = null;
  if (tanggal_lahir) {
    const birthDate = new Date(tanggal_lahir);
    const today = new Date();
    umur = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      umur--;
    }
  }

  db.prepare(`
    UPDATE users SET 
      nama = ?, tempat_lahir = ?, tanggal_lahir = ?, umur = ?, no_hp = ?, email = ?, 
      jenis_kelamin = ?, agama = ?, status_perkawinan = ?, pendidikan = ?, jurusan = ?, 
      alamat_kampung = ?, rt = ?, rw = ?, desa = ?, kecamatan = ?, kabupaten = ?
    WHERE id = ?
  `).run(
    nama, tempat_lahir, tanggal_lahir, umur, no_hp, email,
    jenis_kelamin, agama, status_perkawinan, pendidikan, jurusan,
    alamat_kampung, rt, rw, desa, kecamatan, kabupaten, req.user.id
  );

  res.json({ message: "Profile updated successfully" });
});

// Document Upload
app.post("/api/upload", authenticateToken, upload.single("file"), (req: any, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const field = req.body.type; // e.g., 'ijazah', 'ktp'
  const filePath = req.file.filename;

  db.prepare(`UPDATE documents SET ${field} = ? WHERE user_id = ?`).run(filePath, req.user.id);

  // Check completeness
  const docs: any = db.prepare("SELECT * FROM documents WHERE user_id = ?").get(req.user.id);
  const required = ['ijazah', 'kk', 'ktp', 'skck', 'pas_foto', 'npwp', 'surat_kuning', 'lamaran'];
  const isComplete = required.every(key => docs[key] !== null);
  
  // Only auto-update to 'MENUNGGU VERIFIKASI' if it was 'TIDAK LENGKAP'
  // If it's already 'LENGKAP' (verified), don't change it back unless files are removed (not possible in current UI)
  const currentStatus = docs.status_berkas;
  if (isComplete && currentStatus === 'TIDAK LENGKAP') {
    db.prepare("UPDATE documents SET status_berkas = ? WHERE user_id = ?")
      .run("MENUNGGU VERIFIKASI", req.user.id);
  } else if (!isComplete) {
    db.prepare("UPDATE documents SET status_berkas = ? WHERE user_id = ?")
      .run("TIDAK LENGKAP", req.user.id);
  }

  res.json({ message: "File uploaded successfully", filename: filePath });
});

// Admin Routes
app.get("/api/admin/applicants", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Forbidden" });
  
  const applicants = db.prepare(`
    SELECT u.*, d.status_berkas, d.progress_stage, d.ijazah, d.kk, d.ktp, d.surat_kuning, d.npwp, d.skck, d.lamaran, d.pas_foto
    FROM users u
    JOIN documents d ON u.id = d.user_id
    WHERE u.role = 'user'
  `).all();
  
  res.json(applicants);
});

app.delete("/api/admin/applicants/:id", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Forbidden" });
  
  try {
    // Get document filenames before deleting to clean up disk space
    const docs: any = db.prepare("SELECT * FROM documents WHERE user_id = ?").get(req.params.id);
    
    if (docs) {
      const fileFields = ['ijazah', 'kk', 'ktp', 'surat_kuning', 'npwp', 'skck', 'lamaran', 'pas_foto'];
      fileFields.forEach(field => {
        const filename = docs[field];
        if (filename) {
          const filePath = path.join(process.cwd(), "uploads", filename);
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (fileErr) {
            console.error(`Failed to delete file ${filename}:`, fileErr);
          }
        }
      });
    }

    const result = db.prepare("DELETE FROM users WHERE id = ? AND role = 'user'").run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ message: "Applicant not found or cannot be deleted" });
    }
    
    res.json({ message: "Applicant and their documents deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/admin/applicants/:id/verify", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Forbidden" });
  const { status } = req.body;
  db.prepare("UPDATE documents SET status_berkas = ? WHERE user_id = ?").run(status, req.params.id);
  res.json({ message: "Status updated" });
});

app.put("/api/admin/applicants/:id/progress", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Forbidden" });
  const { progress } = req.body;
  db.prepare("UPDATE documents SET progress_stage = ? WHERE user_id = ?").run(progress, req.params.id);
  res.json({ message: "Progress updated" });
});

app.get("/api/admin/stats", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Forbidden" });
  
  const total = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user'").get() as any;
  const complete = db.prepare("SELECT COUNT(*) as count FROM documents WHERE status_berkas = 'LENGKAP'").get() as any;
  const incomplete = db.prepare("SELECT COUNT(*) as count FROM documents WHERE status_berkas = 'TIDAK LENGKAP'").get() as any;
  
  const educationStats = db.prepare(`
    SELECT pendidikan as name, COUNT(*) as value 
    FROM users 
    WHERE role = 'user' AND pendidikan IS NOT NULL 
    GROUP BY pendidikan
  `).all();

  res.json({
    total: total.count,
    complete: complete.count,
    incomplete: incomplete.count,
    educationStats
  });
});

// Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
