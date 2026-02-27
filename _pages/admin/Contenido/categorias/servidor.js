"use server";

import db from "@/_DB/db";

export async function getCategorias() {
  const [rows] = await db.execute(
    `SELECT
      c.id,
      c.slug,
      c.nombre,
      c.icono,
      c.orden,
      c.activa,
      COUNT(p.id) AS total_productos
    FROM categorias c
    LEFT JOIN productos p ON p.categoria_id = c.id AND p.activo = 1
    GROUP BY c.id
    ORDER BY c.orden ASC`
  );
  return rows;
}

export async function getCategoriaById(id) {
  const [[row]] = await db.execute(
    "SELECT id, slug, nombre, icono, orden, activa FROM categorias WHERE id = ?",
    [id]
  );
  return row || null;
}

export async function crearCategoria(formData) {
  const slug   = formData.get("slug")?.toString().trim().toLowerCase().replace(/\s+/g, "-");
  const nombre = formData.get("nombre")?.toString().trim();
  const icono  = formData.get("icono")?.toString().trim();
  const orden  = formData.get("orden") || 0;
  const activa = formData.get("activa") === "1" ? 1 : 0;

  if (!slug || !nombre) return { error: "Slug y nombre son obligatorios." };

  const [[existe]] = await db.execute(
    "SELECT id FROM categorias WHERE slug = ?", [slug]
  );
  if (existe) return { error: "Ya existe una categoría con ese slug." };

  await db.execute(
    "INSERT INTO categorias (slug, nombre, icono, orden, activa) VALUES (?, ?, ?, ?, ?)",
    [slug, nombre, icono || null, orden, activa]
  );

  return { ok: true };
}

export async function editarCategoria(formData) {
  const id     = formData.get("id");
  const slug   = formData.get("slug")?.toString().trim().toLowerCase().replace(/\s+/g, "-");
  const nombre = formData.get("nombre")?.toString().trim();
  const icono  = formData.get("icono")?.toString().trim();
  const orden  = formData.get("orden") || 0;
  const activa = formData.get("activa") === "1" ? 1 : 0;

  if (!id || !slug || !nombre) return { error: "Slug y nombre son obligatorios." };

  const [[existe]] = await db.execute(
    "SELECT id FROM categorias WHERE slug = ? AND id != ?", [slug, id]
  );
  if (existe) return { error: "Ya existe otra categoría con ese slug." };

  await db.execute(
    "UPDATE categorias SET slug = ?, nombre = ?, icono = ?, orden = ?, activa = ? WHERE id = ?",
    [slug, nombre, icono || null, orden, activa, id]
  );

  return { ok: true };
}

export async function toggleActivaCategoria(id, activa) {
  await db.execute(
    "UPDATE categorias SET activa = ? WHERE id = ?",
    [activa ? 1 : 0, id]
  );
  return { ok: true };
}