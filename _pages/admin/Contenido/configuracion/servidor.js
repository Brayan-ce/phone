"use server";

import db from "@/_DB/db";

export async function getConfiguracion() {
  const [rows] = await db.execute(
    `SELECT clave, valor FROM config_sitio WHERE clave IN (
      'whatsapp_numero',
      'hero_titulo',
      'hero_subtitulo',
      'footer_texto',
      'instagram_url',
      'facebook_url',
      'email'
    )`
  );
  const config = {};
  rows.forEach((r) => (config[r.clave] = r.valor || ""));
  return config;
}

export async function guardarConfiguracion(formData) {
  const claves = [
    "whatsapp_numero",
    "hero_titulo",
    "hero_subtitulo",
    "footer_texto",
    "instagram_url",
    "facebook_url",
    "email",
  ];

  for (const clave of claves) {
    const valor = formData.get(clave)?.toString().trim() || "";
    await db.execute(
      `INSERT INTO config_sitio (clave, valor)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE valor = VALUES(valor)`,
      [clave, valor]
    );
  }

  return { ok: true };
}