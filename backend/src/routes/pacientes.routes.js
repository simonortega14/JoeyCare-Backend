import { Router } from "express";
import pool from "../db.js";

const router = Router();

// Obtener todos los pacientes
router.get("/pacientes", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM pacientes");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los pacientes" });
  }
});

// Crear un nuevo paciente
router.post("/pacientes", async (req, res) => {
  try {
    const { nombre, apellido, fecha_nacimiento } = req.body;

    if (!nombre || !apellido) {
      return res.status(400).json({ message: "Nombre y apellido son obligatorios" });
    }

    const [result] = await pool.query(
      "INSERT INTO pacientes (nombre, apellido, fecha_nacimiento) VALUES (?, ?, ?)",
      [nombre, apellido, fecha_nacimiento || null]
    );

    res.status(201).json({
      id: result.insertId,
      nombre,
      apellido,
      fecha_nacimiento,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear paciente" });
  }
});

// Obtener un paciente por ID
router.get("/pacientes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM pacientes WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener paciente" });
  }
});

export default router;
