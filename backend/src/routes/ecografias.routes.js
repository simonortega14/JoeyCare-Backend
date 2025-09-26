import { Router } from "express";
import pool from "../db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// Crear carpeta uploads si no existe
const uploadsDir = "uploads/";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Carpeta uploads/ creada");
}

// Configuración de multer para guardar archivos en /uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const originalName = file.originalname;
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);

    let finalName = originalName;
    let counter = 1;

    // Mientras exista un archivo con ese nombre, agrega sufijo numérico
    while (fs.existsSync(path.join(uploadsDir, finalName))) {
      finalName = `${baseName}-${counter}${ext}`;
      counter++;
    }

    cb(null, finalName);
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PNG'), false);
    }
  }
});

// Obtener todas las ecografías
router.get("/ecografias", async (req, res) => {
  try {
    console.log("Obteniendo todas las ecografías...");
    const [rows] = await pool.query(
      "SELECT e.id, e.filename, e.uploaded_at, p.nombre, p.apellido FROM ecografias e JOIN pacientes p ON e.paciente_id = p.id"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener ecografías:", error);
    res.status(500).json({ message: "Error al obtener ecografías", error: error.message });
  }
});

// Subir una nueva ecografía vinculada a un paciente
router.post("/ecografias/:pacienteId", upload.single("imagen"), async (req, res) => {
  try {
    console.log("=== INICIANDO SUBIDA DE ECOGRAFÍA ===");
    console.log("Parámetros recibidos:", req.params);
    console.log("Archivo recibido:", req.file ? req.file.filename : "No hay archivo");
    
    const { pacienteId } = req.params;
    
    if (!pacienteId || isNaN(pacienteId)) {
      console.log("ID de paciente inválido:", pacienteId);
      return res.status(400).json({ message: "ID de paciente inválido" });
    }

    if (!req.file) {
      console.log("No se recibió archivo");
      return res.status(400).json({ message: "Se requiere un archivo de imagen" });
    }

    // Verificar que el paciente existe
    console.log("Verificando existencia del paciente...");
    const [pacienteRows] = await pool.query(
      "SELECT id FROM pacientes WHERE id = ?",
      [pacienteId]
    );
    
    if (pacienteRows.length === 0) {
      console.log("Paciente no encontrado:", pacienteId);
      if (fs.existsSync(path.join(uploadsDir, req.file.filename))) {
        fs.unlinkSync(path.join(uploadsDir, req.file.filename));
      }
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

    const filename = req.file.filename;
    console.log("Insertando ecografía en BD con filename:", filename);

    const [result] = await pool.query(
      "INSERT INTO ecografias (paciente_id, filename) VALUES (?, ?)",
      [pacienteId, filename]
    );

    console.log("Ecografía insertada con ID:", result.insertId);

    res.status(201).json({
      message: "Ecografía subida correctamente",
      id: result.insertId,
      paciente_id: pacienteId,
      filename,
    });

  } catch (error) {
    console.error("ERROR en subida de ecografía:", error);
    
    if (req.file && fs.existsSync(path.join(uploadsDir, req.file.filename))) {
      try {
        fs.unlinkSync(path.join(uploadsDir, req.file.filename));
        console.log("Archivo eliminado por error:", req.file.filename);
      } catch (unlinkError) {
        console.error("Error al eliminar archivo:", unlinkError);
      }
    }
    
    res.status(500).json({ 
      message: "Error al subir ecografía",
      error: error.message 
    });
  }
});

// Obtener ecografías de un paciente
router.get("/pacientes/:id/ecografias", async (req, res) => {
  try {
    console.log("Obteniendo ecografías del paciente:", req.params.id);
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM ecografias WHERE paciente_id = ?",
      [id]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener ecografías del paciente:", error);
    res.status(500).json({ 
      message: "Error al obtener ecografías del paciente",
      error: error.message 
    });
  }
});

export default router;
