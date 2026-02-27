"use server";

import db from "@/_DB/db";

export async function getProductoDetalle(id) {
  const [rows] = await db.execute(
    `SELECT
      p.id,
      p.nombre,
      p.subtitulo,
      p.descripcion,
      p.storage,
      p.precio_usd,
      p.badge,
      p.badge_tipo,
      p.imagen_principal,
      p.destacado,
      p.stock,
      c.slug AS categoria_slug,
      c.nombre AS categoria_nombre
    FROM productos p
    INNER JOIN categorias c ON c.id = p.categoria_id
    WHERE p.id = ? AND p.activo = 1`,
    [id]
  );
  return rows[0] || null;
}

export async function getImagenesProducto(productoId) {
  const [rows] = await db.execute(
    `SELECT id, nombre_archivo, alt_texto, es_principal, orden
     FROM producto_imagenes
     WHERE producto_id = ?
     ORDER BY es_principal DESC, orden ASC`,
    [productoId]
  );
  return rows;
}

export async function getColoresProducto(productoId) {
  const [rows] = await db.execute(
    `SELECT nombre, hex_color FROM producto_colores WHERE producto_id = ?`,
    [productoId]
  );
  return rows;
}

export async function getRelacionados(categoriaSlug, excludeId) {
  const [rows] = await db.execute(
    `SELECT
      p.id,
      p.nombre,
      p.subtitulo,
      p.storage,
      p.precio_usd,
      p.badge,
      p.badge_tipo,
      p.imagen_principal
    FROM productos p
    INNER JOIN categorias c ON c.id = p.categoria_id
    WHERE c.slug = ? AND p.id != ? AND p.activo = 1
    ORDER BY p.destacado DESC, RAND()
    LIMIT 8`,
    [categoriaSlug, excludeId]
  );
  return rows;
}

export async function getConfigWhatsapp() {
  const [rows] = await db.execute(
    `SELECT valor FROM config_sitio WHERE clave = 'whatsapp_numero' LIMIT 1`
  );
  return rows[0]?.valor || "TUNUMERO";
}