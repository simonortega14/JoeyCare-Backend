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


SELECT * FROM doctores;

CREATE TABLE pacientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  sexo ENUM('M', 'F') NOT NULL,
  documento VARCHAR(50) UNIQUE NOT NULL,
  fecha_nacimiento DATE,
  edad_gestacional_sem INT,
  edad_corregida_sem INT,
  peso_nacimiento_g DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ecografias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  paciente_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
);

INSERT INTO pacientes (nombre, apellido, fecha_nacimiento) 
VALUES ('Maria', 'Pérez', '2020-05-12');

SELECT * FROM ecografias;