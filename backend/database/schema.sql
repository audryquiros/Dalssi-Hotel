CREATE DATABASE IF NOT EXISTS dalssi_hotel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dalssi_hotel;

CREATE TABLE IF NOT EXISTS personas (
  id_persona INT AUTO_INCREMENT PRIMARY KEY,
  identificacion VARCHAR(15), nombre VARCHAR(50), apellidos VARCHAR(60),
  telefono VARCHAR(30), correo VARCHAR(100)
);
CREATE TABLE IF NOT EXISTS clientes (
  id_cliente INT AUTO_INCREMENT PRIMARY KEY,
  id_persona INT NOT NULL UNIQUE,
  direccion VARCHAR(255), fecha_registro DATETIME,
  CONSTRAINT fk_clientes_personas FOREIGN KEY (id_persona) REFERENCES personas(id_persona)
);
CREATE TABLE IF NOT EXISTS paises (
  id_pais INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100), nacionalidad VARCHAR(150)
);
CREATE TABLE IF NOT EXISTS huespedes (
  id_huesped INT AUTO_INCREMENT PRIMARY KEY,
  id_persona INT NOT NULL UNIQUE, id_pais INT NOT NULL,
  CONSTRAINT fk_huespedes_personas FOREIGN KEY (id_persona) REFERENCES personas(id_persona),
  CONSTRAINT fk_huespedes_paises FOREIGN KEY (id_pais) REFERENCES paises(id_pais)
);
CREATE TABLE IF NOT EXISTS puesto (
  id_puesto INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(60) NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS empleados (
  id_empleado INT AUTO_INCREMENT PRIMARY KEY,
  id_persona INT NOT NULL UNIQUE,
  id_puesto INT NOT NULL,
  fecha_contratacion DATETIME,
  estado ENUM('activo','inactivo'),
  CONSTRAINT fk_empleados_personas FOREIGN KEY (id_persona) REFERENCES personas(id_persona),
  CONSTRAINT fk_empleados_puesto FOREIGN KEY (id_puesto) REFERENCES puesto(id_puesto)
);
CREATE TABLE IF NOT EXISTS tipos_habitacion (
  id_tipo_habitacion INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100), descripcion TEXT, capacidad INT, precio_base DECIMAL(10,2)
);
CREATE TABLE IF NOT EXISTS habitaciones (
  id_habitacion INT AUTO_INCREMENT PRIMARY KEY,
  id_tipo_habitacion INT NOT NULL, numero VARCHAR(10) UNIQUE, piso INT, ubicacion VARCHAR(255),
  descripcion TEXT, estado ENUM('disponible','ocupada','mantenimiento','limpieza'),
  CONSTRAINT fk_habitaciones_tipos FOREIGN KEY (id_tipo_habitacion) REFERENCES tipos_habitacion(id_tipo_habitacion)
);
CREATE TABLE IF NOT EXISTS reservaciones (
  id_reservacion INT AUTO_INCREMENT PRIMARY KEY,
  id_cliente INT NOT NULL, id_empleado INT NOT NULL, fecha_reservacion DATETIME,
  fecha_entrada DATE, fecha_salida DATE,
  estado ENUM('pendiente','confirmada','en_curso','finalizada','cancelada'), observaciones TEXT,
  CONSTRAINT fk_reservaciones_clientes FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
  CONSTRAINT fk_reservaciones_empleados FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado)
);
CREATE TABLE IF NOT EXISTS detalle_reservacion (
  id_detalle_reservacion INT AUTO_INCREMENT PRIMARY KEY,
  id_reservacion INT NOT NULL, id_habitacion INT NOT NULL, precio_noche DECIMAL(10,2),
  CONSTRAINT fk_detalle_reservacion_reservaciones FOREIGN KEY (id_reservacion) REFERENCES reservaciones(id_reservacion),
  CONSTRAINT fk_detalle_reservacion_habitaciones FOREIGN KEY (id_habitacion) REFERENCES habitaciones(id_habitacion)
);
CREATE TABLE IF NOT EXISTS detalle_huespedes (
  id_detalle_huesped INT AUTO_INCREMENT PRIMARY KEY,
  id_detalle_reservacion INT NOT NULL, id_huesped INT NOT NULL,
  CONSTRAINT fk_detalle_huespedes_detalle FOREIGN KEY (id_detalle_reservacion) REFERENCES detalle_reservacion(id_detalle_reservacion),
  CONSTRAINT fk_detalle_huespedes_huesped FOREIGN KEY (id_huesped) REFERENCES huespedes(id_huesped)
);
CREATE TABLE IF NOT EXISTS categorias_servicios (
  id_categoria_servicio INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50), descripcion TEXT, estado ENUM('activo','inactivo')
);
CREATE TABLE IF NOT EXISTS servicios (
  id_servicio INT AUTO_INCREMENT PRIMARY KEY,
  id_categoria_servicio INT NOT NULL, nombre VARCHAR(100), descripcion TEXT, precio DECIMAL(10,2),
  estado ENUM('activo','inactivo'),
  CONSTRAINT fk_servicios_categorias FOREIGN KEY (id_categoria_servicio) REFERENCES categorias_servicios(id_categoria_servicio)
);
CREATE TABLE IF NOT EXISTS reservacion_servicios (
  id_reservacion_servicio INT AUTO_INCREMENT PRIMARY KEY,
  id_reservacion INT NOT NULL, id_servicio INT NOT NULL, fecha_servicio DATETIME,
  cantidad INT, precio_unitario DECIMAL(10,2), subtotal DECIMAL(10,2),
  CONSTRAINT fk_reservacion_servicios_reservaciones FOREIGN KEY (id_reservacion) REFERENCES reservaciones(id_reservacion),
  CONSTRAINT fk_reservacion_servicios_servicios FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio)
);
CREATE TABLE IF NOT EXISTS pagos (
  id_pago INT AUTO_INCREMENT PRIMARY KEY,
  id_reservacion INT NOT NULL, fecha_pago DATETIME, monto DECIMAL(10,2),
  metodo_pago ENUM('sinpe','transferencia','tarjeta','efectivo'),
  estado ENUM('pendiente','confirmado','rechazado','anulado'),
  CONSTRAINT fk_pagos_reservaciones FOREIGN KEY (id_reservacion) REFERENCES reservaciones(id_reservacion)
);
CREATE TABLE IF NOT EXISTS facturas (
  id_factura INT AUTO_INCREMENT PRIMARY KEY,
  id_reservacion INT NOT NULL, numero_factura VARCHAR(30) UNIQUE, fecha_emision DATETIME,
  subtotal DECIMAL(10,2), impuestos DECIMAL(10,2), total DECIMAL(10,2),
  estado ENUM('emitida','anulada'),
  CONSTRAINT fk_facturas_reservaciones FOREIGN KEY (id_reservacion) REFERENCES reservaciones(id_reservacion)
);
CREATE TABLE IF NOT EXISTS detalle_factura (
  id_detalle_factura INT AUTO_INCREMENT PRIMARY KEY,
  id_factura INT NOT NULL, descripcion TEXT, cantidad INT, precio_unitario DECIMAL(10,2), subtotal DECIMAL(10,2),
  CONSTRAINT fk_detalle_factura_facturas FOREIGN KEY (id_factura) REFERENCES facturas(id_factura)
);
