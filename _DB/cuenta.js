import bcrypt from 'bcryptjs';
import db from './db.js';
const username = 'admin';
const password = 'admin123';
const hash = await bcrypt.hash(password, 12);
await db.execute(
  'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
  [username, hash]
);
await db.end();