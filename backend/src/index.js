import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import doctoresRoutes from "./routes/doctores.routes.js"; 
import testRoutes from "./routes/test.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use("/api", testRoutes);
app.use("/api", doctoresRoutes); 

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
