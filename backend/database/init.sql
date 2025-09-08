-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS joeycare_db;

-- Usar la base
USE joeycare_db;

-- Crear tabla doctores
CREATE TABLE IF NOT EXISTS doctores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  sede VARCHAR(100),
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

-- Insertar un doctor de prueba
INSERT INTO doctores (nombre, apellido, sede, email, password)
VALUES ('Juan', 'Pérez', 'Clínica Central', 'juan.perez@joeycare.com', '123456');
