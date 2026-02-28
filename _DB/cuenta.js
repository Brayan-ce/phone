/*import bcrypt from 'bcryptjs';
import db from './db.js';
const username = 'admin';
const password = 'admin123';
const hash = await bcrypt.hash(password, 12);
await db.execute(
  'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
  [username, hash]
);
await db.end();/*/
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

const username = "admin";
const password = "admin123";

const db = await mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "brayan",
  password: "123456",
  database: "m_importaciones",
});

const hash = await bcrypt.hash(password, 12);

await db.execute(
  "INSERT INTO admins (username, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)",
  [username, hash]
);

console.log(`Admin "${username}" creado correctamente.`);

await db.end();