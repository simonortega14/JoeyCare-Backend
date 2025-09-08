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

export default router;
