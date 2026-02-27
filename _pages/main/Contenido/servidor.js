"use server";

import db from "@/_DB/db";

export async function getProductosPorCategoria(slug) {
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
    ORDER BY p.precio_usd ASC`,
    [slug]
  );
  return rows;
}

export async function getColoresPorProducto(productoId) {
  const [rows] = await db.execute(
    `SELECT nombre, hex_color FROM producto_colores WHERE producto_id = ?`,
    [productoId]
  );
  return rows;
}

export async function getProductosConColores(slug) {
  const productos = await getProductosPorCategoria(slug);
  const conColores = await Promise.all(
    productos.map(async (p) => {
      const colores = await getColoresPorProducto(p.id);
      return { ...p, colores };
    })
  );
  return conColores;
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