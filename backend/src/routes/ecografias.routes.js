import { Router } from "express";
import pool from "../db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// Carpeta uploads
const uploadsDir = "uploads/";
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer: PNG, JPG y DCM
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    let finalName = file.originalname;
    let counter = 1;
    while (fs.existsSync(path.join(uploadsDir, finalName))) {
      finalName = `${base}-${counter}${ext}`;
      counter++;
    }
    cb(null, finalName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedExts = ["image/png", "image/jpeg", "application/dicom"];
    if (allowedExts.includes(file.mimetype) || /\.dcm$/i.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos PNG, JPG o DICOM"), false);
    }
  },
});

// Obtener todas las ecografías
router.get("/ecografias", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT e.id, e.filename, e.uploaded_at, p.nombre, p.apellido FROM ecografias e JOIN pacientes p ON e.paciente_id = p.id"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener ecografías", error: error.message });
  }
});

// Subir ecografía
router.post("/ecografias/:pacienteId", upload.single("imagen"), async (req, res) => {
  try {
    const { pacienteId } = req.params;
    if (!req.file) return res.status(400).json({ message: "Se requiere archivo" });

    const [pacienteRows] = await pool.query(
      "SELECT id FROM pacientes WHERE id = ?",
      [pacienteId]
    );
    if (pacienteRows.length === 0) {
      fs.unlinkSync(path.join(uploadsDir, req.file.filename));
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

    const [result] = await pool.query(
      "INSERT INTO ecografias (paciente_id, filename) VALUES (?, ?)",
      [pacienteId, req.file.filename]
    );

    res.status(201).json({
      message: "Ecografía subida correctamente",
      id: result.insertId,
      paciente_id: pacienteId,
      filename: req.file.filename,
    });

  } catch (error) {
    if (req.file && fs.existsSync(path.join(uploadsDir, req.file.filename))) {
      fs.unlinkSync(path.join(uploadsDir, req.file.filename));
    }
    res.status(500).json({ message: "Error al subir ecografía", error: error.message });
  }
});

// Obtener ecografías de un paciente
router.get("/pacientes/:id/ecografias", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM ecografias WHERE paciente_id = ?",
      [id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener ecografías del paciente", error: error.message });
  }
});

// Servir archivos
router.get("/uploads/:filename", (req, res) => {
  const filePath = path.join(uploadsDir, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).send("Archivo no encontrado");

  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".dcm") res.type("application/dicom");
  res.sendFile(path.resolve(filePath));
});

export default router;
