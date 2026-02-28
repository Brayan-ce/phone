"use server";

import db from "@/_DB/db";

export async function getCategorias() {
  const [rows] = await db.execute(
    "SELECT id, slug, nombre, icono FROM categorias WHERE activa = 1 ORDER BY orden ASC"
  );
  return rows;
}

export async function getProductosPorCategoria(slug, page = 1, limit = 12) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, parseInt(limit, 10) || 12);
  const offset = (p - 1) * l;
  const [rows] = await db.execute(
    `SELECT 
      p.id,
      p.nombre,
      p.subtitulo,
      p.storage,
      p.precio_usd,
      p.badge,
      p.badge_tipo,
      p.imagen_principal,
      p.destacado,
      p.stock
    FROM productos p
    INNER JOIN categorias c ON c.id = p.categoria_id
    WHERE c.slug = ? AND p.activo = 1
    ORDER BY p.precio_usd ASC
    LIMIT ${l} OFFSET ${offset}`,
    [slug]
  );
  return rows;
}

export async function getTotalProductos(slug) {
  const [rows] = await db.execute(
    `SELECT COUNT(*) as total
    FROM productos p
    INNER JOIN categorias c ON c.id = p.categoria_id
    WHERE c.slug = ? AND p.activo = 1`,
    [slug]
  );
  return Number(rows[0].total);
}

export async function getColoresPorProducto(productoId) {
  const [rows] = await db.execute(
    `SELECT nombre, hex_color FROM producto_colores WHERE producto_id = ?`,
    [productoId]
  );
  return rows;
}

export async function getProductosConColores(slug, page = 1, limit = 12) {
  const [productos, total] = await Promise.all([
    getProductosPorCategoria(slug, page, limit),
    getTotalProductos(slug),
  ]);
  const conColores = await Promise.all(
    productos.map(async (p) => {
      const colores = await getColoresPorProducto(p.id);
      return { ...p, colores };
    })
  );
  return {
    productos: conColores,
    total,
    totalPages: Math.ceil(total / limit),
    page,
  };
}

export async function getConfigHero() {
  const [rows] = await db.execute(
    `SELECT clave, valor FROM config_sitio WHERE clave IN (
      'hero_titulo',
      'hero_subtitulo',
      'whatsapp_numero'
    )`
  );
  const config = {};
  rows.forEach((r) => (config[r.clave] = r.valor));
  return config;
}