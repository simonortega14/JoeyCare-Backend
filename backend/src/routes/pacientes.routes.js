import { Router } from "express";
import pool from "../db.js";

const router = Router();

// Obtener todos los pacientes con filtros opcionales
router.get("/pacientes", async (req, res) => {
  try {
    const { peso_min, peso_max, edad_gestacional_min, edad_gestacional_max, edad_corregida_min, edad_corregida_max } = req.query;

    let query = "SELECT id, nombre, apellido, sexo, documento, fecha_nacimiento, edad_gestacional_sem, edad_corregida_sem, peso_nacimiento_g FROM pacientes WHERE 1=1";
    let params = [];

    if (peso_min) {
      query += " AND peso_nacimiento_g >= ?";
      params.push(parseFloat(peso_min));
    }
    if (peso_max) {
      query += " AND peso_nacimiento_g <= ?";
      params.push(parseFloat(peso_max));
    }
    if (edad_gestacional_min) {
      query += " AND edad_gestacional_sem >= ?";
      params.push(parseInt(edad_gestacional_min));
    }
    if (edad_gestacional_max) {
      query += " AND edad_gestacional_sem <= ?";
      params.push(parseInt(edad_gestacional_max));
    }
    if (edad_corregida_min) {
      query += " AND edad_corregida_sem >= ?";
      params.push(parseInt(edad_corregida_min));
    }
    if (edad_corregida_max) {
      query += " AND edad_corregida_sem <= ?";
      params.push(parseInt(edad_corregida_max));
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los pacientes" });
  }
});

// Crear un nuevo paciente
router.post("/pacientes", async (req, res) => {
  try {
    const { nombre, apellido, sexo, documento, fecha_nacimiento, edad_gestacional_sem, edad_corregida_sem, peso_nacimiento_g } = req.body;

    if (!nombre || !apellido || !sexo || !documento) {
      return res.status(400).json({ message: "Nombre, apellido, sexo y documento son obligatorios" });
    }

    const [result] = await pool.query(
      "INSERT INTO pacientes (nombre, apellido, sexo, documento, fecha_nacimiento, edad_gestacional_sem, edad_corregida_sem, peso_nacimiento_g) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [nombre, apellido, sexo, documento, fecha_nacimiento || null, edad_gestacional_sem || null, edad_corregida_sem || null, peso_nacimiento_g || null]
    );

    res.status(201).json({
      id: result.insertId,
      nombre,
      apellido,
      sexo,
      documento,
      fecha_nacimiento,
      edad_gestacional_sem,
      edad_corregida_sem,
      peso_nacimiento_g,
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
