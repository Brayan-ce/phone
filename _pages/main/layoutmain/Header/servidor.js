"use server";

import db from "@/_DB/db";

export async function getCategorias() {
  const [rows] = await db.execute(
    "SELECT id, slug, nombre, icono FROM categorias WHERE activa = 1 ORDER BY orden ASC"
  );
  return rows;
}

export async function getConfigSitio() {
  const [rows] = await db.execute(
    "SELECT clave, valor FROM config_sitio WHERE clave IN ('whatsapp_numero', 'logo_url')"
  );
  const config = {};
  rows.forEach((r) => (config[r.clave] = r.valor));
  return config;
}

export async function buscarProductos(query) {
  if (!query || query.trim().length < 2) return [];
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
      c.nombre AS categoria_nombre
    FROM productos p
    INNER JOIN categorias c ON c.id = p.categoria_id
    WHERE p.activo = 1 AND (
      p.nombre LIKE ? OR
      p.subtitulo LIKE ? OR
      p.storage LIKE ?
    )
    ORDER BY p.destacado DESC, p.precio_usd ASC
    LIMIT 8`,
    [`%${query}%`, `%${query}%`, `%${query}%`]
  );
  return rows;
}