"use server";

import db from "@/_DB/db";

export async function getDashboardStats() {
  const [[totalProd]] = await db.execute(
    "SELECT COUNT(*) AS total FROM productos WHERE activo = 1"
  );
  const [[totalCat]] = await db.execute(
    "SELECT COUNT(*) AS total FROM categorias WHERE activa = 1"
  );
  const [[sinStock]] = await db.execute(
    "SELECT COUNT(*) AS total FROM productos WHERE activo = 1 AND stock = 0"
  );
  const [[destacados]] = await db.execute(
    "SELECT COUNT(*) AS total FROM productos WHERE activo = 1 AND destacado = 1"
  );
  const [[promedio]] = await db.execute(
    "SELECT AVG(precio_usd) AS promedio FROM productos WHERE activo = 1"
  );

  return {
    totalProductos: totalProd.total,
    totalCategorias: totalCat.total,
    sinStock: sinStock.total,
    destacados: destacados.total,
    precioPromedio: promedio.promedio ? Number(promedio.promedio).toFixed(2) : "0.00",
  };
}

export async function getUltimosProductos() {
  const [rows] = await db.execute(
    `SELECT
      p.id,
      p.nombre,
      p.storage,
      p.precio_usd,
      p.stock,
      p.badge_tipo,
      p.imagen_principal,
      c.nombre AS categoria_nombre
    FROM productos p
    INNER JOIN categorias c ON c.id = p.categoria_id
    WHERE p.activo = 1
    ORDER BY p.created_at DESC
    LIMIT 6`
  );
  return rows;
}

export async function getProductosSinStock() {
  const [rows] = await db.execute(
    `SELECT
      p.id,
      p.nombre,
      p.storage,
      p.precio_usd,
      p.imagen_principal,
      c.nombre AS categoria_nombre
    FROM productos p
    INNER JOIN categorias c ON c.id = p.categoria_id
    WHERE p.activo = 1 AND p.stock = 0
    ORDER BY p.updated_at DESC
    LIMIT 6`
  );
  return rows;
}