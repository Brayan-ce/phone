CREATE DATABASE IF NOT EXISTS m_importaciones CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE m_importaciones;

CREATE TABLE admins (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categorias (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  icono VARCHAR(100),
  orden TINYINT UNSIGNED DEFAULT 0,
  activa TINYINT(1) DEFAULT 1
);

CREATE TABLE productos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  categoria_id INT UNSIGNED NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  subtitulo VARCHAR(100),
  descripcion TEXT,
  storage VARCHAR(50),
  precio_usd DECIMAL(10,2) NOT NULL,
  badge VARCHAR(50),
  badge_tipo ENUM('nuevo','pro','usado','oferta') DEFAULT 'nuevo',
  imagen_principal VARCHAR(255),
  activo TINYINT(1) DEFAULT 1,
  destacado TINYINT(1) DEFAULT 0,
  stock INT UNSIGNED DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT
);

CREATE TABLE producto_colores (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  producto_id INT UNSIGNED NOT NULL,
  nombre VARCHAR(80) NOT NULL,
  hex_color VARCHAR(7) NOT NULL,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

CREATE TABLE producto_imagenes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  producto_id INT UNSIGNED NOT NULL,
  nombre_archivo VARCHAR(255) NOT NULL,
  alt_texto VARCHAR(255),
  es_principal TINYINT(1) DEFAULT 0,
  orden TINYINT UNSIGNED DEFAULT 0,
  width INT UNSIGNED,
  height INT UNSIGNED,
  size_kb INT UNSIGNED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

CREATE TABLE config_sitio (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  clave VARCHAR(100) NOT NULL UNIQUE,
  valor TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO categorias (slug, nombre, icono, orden) VALUES
('nuevos',     'iPhone Nuevos',   'phone-portrait-outline', 1),
('usados',     'iPhone Usados',   'refresh-outline',        2),
('mac',        'Mac & iPad',      'laptop-outline',         3),
('watch',      'Watch & AirPods', 'watch-outline',          4),
('accesorios', 'Accesorios',      'headset-outline',        5),
('android',    'Android',         'logo-android',           6);

INSERT INTO config_sitio (clave, valor) VALUES
('whatsapp_numero', 'TUNUMERO'),
('hero_titulo',     'Los mejores precios en tecnologia Apple'),
('hero_subtitulo',  'Stock disponible para entrega inmediata. Precios sin competencia.'),
('footer_texto',    'Los mejores precios en tecnologia Apple con stock garantizado.'),
('instagram_url',   '#'),
('facebook_url',    '#'),
('email',           'contacto@mimportaciones.com');

INSERT INTO productos (categoria_id, nombre, subtitulo, storage, precio_usd, badge, badge_tipo, imagen_principal, activo, stock) VALUES
(1, 'iPhone 14',         'iPhone 14',         '128 GB', 600.00,  'Nuevo',   'nuevo', 'iphone14.webp',         1, 10),
(1, 'iPhone 15',         'iPhone 15',         '128 GB', 660.00,  'Nuevo',   'nuevo', 'iphone15.webp',         1, 8),
(1, 'iPhone 16',         'iPhone 16',         '128 GB', 770.00,  'Nuevo',   'nuevo', 'iphone16.webp',         1, 12),
(1, 'iPhone 17 Pro',     'iPhone 17 Pro',     '256 GB', 1320.00, 'Pro',     'pro',   'iphone17pro.webp',      1, 5),
(1, 'iPhone 17 Pro Max', 'iPhone 17 Pro Max', '256 GB', 1420.00, 'Pro Max', 'pro',   'iphone17promax.webp',   1, 3);

INSERT INTO producto_colores (producto_id, nombre, hex_color) VALUES
(1, 'Midnight',      '#1c1c1e'),
(2, 'Black',         '#1c1c1e'),
(2, 'Blue',          '#4a90d9'),
(3, 'Pink',          '#f2a7bb'),
(3, 'White',         '#f5f5f0'),
(3, 'Ultramarine',   '#3d6be0'),
(3, 'Black',         '#1c1c1e'),
(3, 'Teal',          '#4a8c87'),
(4, 'Cosmic Orange', '#c06030'),
(4, 'Deep Blue',     '#1a3a6e'),
(4, 'Silver',        '#d8d8d8'),
(5, 'Cosmic Orange', '#c06030'),
(5, 'Deep Blue',     '#1a3a6e'),
(5, 'Silver',        '#d8d8d8');

INSERT INTO producto_imagenes (producto_id, nombre_archivo, alt_texto, es_principal, orden) VALUES
(1, 'iphone14.webp',        'iPhone 14 Midnight',       1, 0),
(2, 'iphone15.webp',        'iPhone 15 Black',          1, 0),
(3, 'iphone16.webp',        'iPhone 16 Pink',           1, 0),
(4, 'iphone17pro.webp',     'iPhone 17 Pro',            1, 0),
(5, 'iphone17promax.webp',  'iPhone 17 Pro Max',        1, 0);