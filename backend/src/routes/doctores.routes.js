import { Router } from "express";
import pool from "../db.js";

const router = Router();

// Obtener todos los doctores
router.get("/doctores", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM doctores");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los doctores" });
  }
});

// Crear un nuevo doctor
router.post("/doctores", async (req, res) => {
  try {
    const { nombre, apellido, sede, email, password } = req.body;

    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({ message: "Todos los campos obligatorios deben estar llenos" });
    }

    const [result] = await pool.query(
      "INSERT INTO doctores (nombre, apellido, sede, email, password) VALUES (?, ?, ?, ?, ?)",
      [nombre, apellido, sede || null, email, password]
    );

    res.status(201).json({
      id: result.insertId,
      nombre,
      apellido,
      sede,
      email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el doctor" });
  }
});

// Login de doctor
router.post("/doctores/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email y contraseña son obligatorios" });
    }

    const [rows] = await pool.query(
      "SELECT * FROM doctores WHERE email = ? AND password = ?",
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    // Por ahora devolvemos los datos básicos del doctor
    const doctor = rows[0];
    res.json({
      id: doctor.id,
      nombre: doctor.nombre,
      apellido: doctor.apellido,
      sede: doctor.sede,
      email: doctor.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el login" });
  }
});


export default router;
