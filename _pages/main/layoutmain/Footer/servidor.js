"use server";

import db from "@/_DB/db";

export async function getFooterData() {
  const [categorias] = await db.execute(
    "SELECT slug, nombre FROM categorias WHERE activa = 1 ORDER BY orden ASC"
  );
  const [config] = await db.execute(
    `SELECT clave, valor FROM config_sitio WHERE clave IN (
      'whatsapp_numero',
      'footer_texto'
    )`
  );
  const cfg = {};
  config.forEach((r) => (cfg[r.clave] = r.valor));
  return { categorias, config: cfg };
}