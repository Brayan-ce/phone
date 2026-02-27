"use server";

import db from "@/_DB/db";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

const UPLOADS_DIR = process.env.UPLOADS_PATH || path.join(process.cwd(), "public", "uploads");

async function asegurarDirectorio() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

async function guardarImagen(file) {
  await asegurarDirectorio();
  const buffer = Buffer.from(await file.arrayBuffer());
  const nombre = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
  const destino = path.join(UPLOADS_DIR, nombre);
  await sharp(buffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(destino);
  return nombre;
}

async function eliminarArchivo(nombre) {
  if (!nombre) return;
  try {
    await fs.unlink(path.join(UPLOADS_DIR, nombre));
  } catch {}
}

export async function getCategoriasList() {
  const [rows] = await db.execute(
    "SELECT id, nombre FROM categorias WHERE activa = 1 ORDER BY orden ASC"
  );
  return rows;
}

export async function getProductos() {
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
      p.stock,
      p.destacado,
      p.activo,
      c.nombre AS categoria_nombre
    FROM productos p
    INNER JOIN categorias c ON c.id = p.categoria_id
    ORDER BY p.created_at DESC`
  );
  return rows;
}

export async function getProductoById(id) {
  const [[prod]] = await db.execute(
    `SELECT
      p.id, p.nombre, p.subtitulo, p.descripcion, p.storage,
      p.precio_usd, p.badge, p.badge_tipo, p.imagen_principal,
      p.stock, p.destacado, p.activo, p.categoria_id
    FROM productos p WHERE p.id = ?`,
    [id]
  );
  if (!prod) return null;
  const [colores] = await db.execute(
    "SELECT id, nombre, hex_color FROM producto_colores WHERE producto_id = ?",
    [id]
  );
  const [imagenes] = await db.execute(
    "SELECT id, nombre_archivo, alt_texto, es_principal, orden FROM producto_imagenes WHERE producto_id = ? ORDER BY es_principal DESC, orden ASC",
    [id]
  );
  return { ...prod, colores, imagenes };
}

export async function crearProducto(formData) {
  const categoriaId  = formData.get("categoria_id");
  const nombre       = formData.get("nombre")?.toString().trim();
  const subtitulo    = formData.get("subtitulo")?.toString().trim();
  const descripcion  = formData.get("descripcion")?.toString().trim();
  const storage      = formData.get("storage")?.toString().trim();
  const precioUsd    = formData.get("precio_usd");
  const badge        = formData.get("badge")?.toString().trim();
  const badgeTipo    = formData.get("badge_tipo") || "nuevo";
  const stock        = formData.get("stock") || 0;
  const destacado    = formData.get("destacado") === "1" ? 1 : 0;

  if (!nombre || !categoriaId || !precioUsd) {
    return { error: "Nombre, categoría y precio son obligatorios." };
  }

  const imagenFile = formData.get("imagen_principal");
  let imagenPrincipal = null;
  if (imagenFile && imagenFile.size > 0) {
    imagenPrincipal = await guardarImagen(imagenFile);
  }

  const [result] = await db.execute(
    `INSERT INTO productos
      (categoria_id, nombre, subtitulo, descripcion, storage, precio_usd, badge, badge_tipo, imagen_principal, stock, destacado, activo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [categoriaId, nombre, subtitulo || null, descripcion || null, storage || null,
     precioUsd, badge || null, badgeTipo, imagenPrincipal, stock, destacado]
  );

  const productoId = result.insertId;

  const coloresRaw = formData.get("colores");
  if (coloresRaw) {
    const colores = JSON.parse(coloresRaw);
    for (const c of colores) {
      if (c.nombre && c.hex_color) {
        await db.execute(
          "INSERT INTO producto_colores (producto_id, nombre, hex_color) VALUES (?, ?, ?)",
          [productoId, c.nombre, c.hex_color]
        );
      }
    }
  }

  const imagenesExtra = formData.getAll("imagenes_extra");
  for (let i = 0; i < imagenesExtra.length; i++) {
    const f = imagenesExtra[i];
    if (f && f.size > 0) {
      const nombre_archivo = await guardarImagen(f);
      await db.execute(
        "INSERT INTO producto_imagenes (producto_id, nombre_archivo, es_principal, orden) VALUES (?, ?, 0, ?)",
        [productoId, nombre_archivo, i]
      );
    }
  }

  if (imagenPrincipal) {
    await db.execute(
      "INSERT INTO producto_imagenes (producto_id, nombre_archivo, es_principal, orden) VALUES (?, ?, 1, 0)",
      [productoId, imagenPrincipal]
    );
  }

  return { ok: true, id: productoId };
}

export async function editarProducto(formData) {
  const id           = formData.get("id");
  const categoriaId  = formData.get("categoria_id");
  const nombre       = formData.get("nombre")?.toString().trim();
  const subtitulo    = formData.get("subtitulo")?.toString().trim();
  const descripcion  = formData.get("descripcion")?.toString().trim();
  const storage      = formData.get("storage")?.toString().trim();
  const precioUsd    = formData.get("precio_usd");
  const badge        = formData.get("badge")?.toString().trim();
  const badgeTipo    = formData.get("badge_tipo") || "nuevo";
  const stock        = formData.get("stock") || 0;
  const destacado    = formData.get("destacado") === "1" ? 1 : 0;
  const activo       = formData.get("activo") === "1" ? 1 : 0;

  if (!id || !nombre || !categoriaId || !precioUsd) {
    return { error: "Nombre, categoría y precio son obligatorios." };
  }

  const [[actual]] = await db.execute(
    "SELECT imagen_principal FROM productos WHERE id = ?", [id]
  );

  const imagenFile = formData.get("imagen_principal");
  let imagenPrincipal = actual?.imagen_principal || null;
  if (imagenFile && imagenFile.size > 0) {
    if (imagenPrincipal) await eliminarArchivo(imagenPrincipal);
    imagenPrincipal = await guardarImagen(imagenFile);
    await db.execute(
      "UPDATE producto_imagenes SET nombre_archivo = ? WHERE producto_id = ? AND es_principal = 1",
      [imagenPrincipal, id]
    );
  }

  await db.execute(
    `UPDATE productos SET
      categoria_id = ?, nombre = ?, subtitulo = ?, descripcion = ?,
      storage = ?, precio_usd = ?, badge = ?, badge_tipo = ?,
      imagen_principal = ?, stock = ?, destacado = ?, activo = ?
     WHERE id = ?`,
    [categoriaId, nombre, subtitulo || null, descripcion || null, storage || null,
     precioUsd, badge || null, badgeTipo, imagenPrincipal, stock, destacado, activo, id]
  );

  const coloresRaw = formData.get("colores");
  if (coloresRaw !== null) {
    await db.execute("DELETE FROM producto_colores WHERE producto_id = ?", [id]);
    const colores = JSON.parse(coloresRaw);
    for (const c of colores) {
      if (c.nombre && c.hex_color) {
        await db.execute(
          "INSERT INTO producto_colores (producto_id, nombre, hex_color) VALUES (?, ?, ?)",
          [id, c.nombre, c.hex_color]
        );
      }
    }
  }

  const imagenesExtra = formData.getAll("imagenes_extra");
  for (let i = 0; i < imagenesExtra.length; i++) {
    const f = imagenesExtra[i];
    if (f && f.size > 0) {
      const nombre_archivo = await guardarImagen(f);
      const [existing] = await db.execute(
        "SELECT COUNT(*) AS total FROM producto_imagenes WHERE producto_id = ?", [id]
      );
      const orden = existing[0].total;
      await db.execute(
        "INSERT INTO producto_imagenes (producto_id, nombre_archivo, es_principal, orden) VALUES (?, ?, 0, ?)",
        [id, nombre_archivo, orden]
      );
    }
  }

  return { ok: true };
}

export async function eliminarImagenProducto(imagenId, nombreArchivo) {
  await db.execute("DELETE FROM producto_imagenes WHERE id = ?", [imagenId]);
  await eliminarArchivo(nombreArchivo);
  return { ok: true };
}

export async function eliminarProducto(id) {
  await db.execute("UPDATE productos SET activo = 0 WHERE id = ?", [id]);
  return { ok: true };
}