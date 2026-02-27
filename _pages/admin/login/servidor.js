"use server";

import db from "@/_DB/db";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession } from "iron-session";

const SESSION_PASSWORD = process.env.SESSION_SECRET;

if (!SESSION_PASSWORD || SESSION_PASSWORD.length < 32) {
  throw new Error(
    "SESSION_SECRET no definida o menor a 32 caracteres. Revisá tu .env.local"
  );
}

const SESSION_OPTIONS = {
  password: SESSION_PASSWORD,
  cookieName: "m_importaciones_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
  },
};

async function getSession() {
  const cookieStore = await cookies();
  return getIronSession(cookieStore, SESSION_OPTIONS);
}

export async function loginAdmin(formData) {
  const username = formData.get("username")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!username || !password) {
    return { error: "Completa todos los campos." };
  }

  const [rows] = await db.execute(
    "SELECT id, username, password_hash FROM admins WHERE username = ? LIMIT 1",
    [username]
  );

  const admin = rows[0];

  if (!admin) {
    return { error: "Credenciales incorrectas." };
  }

  const valida = await bcrypt.compare(password, admin.password_hash);

  if (!valida) {
    return { error: "Credenciales incorrectas." };
  }

  const session = await getSession();
  session.adminId = admin.id;
  session.adminUsername = admin.username;
  session.isLoggedIn = true;
  await session.save();

  redirect("/admin");
}

export async function getSessionAdmin() {
  const session = await getSession();
  if (!session.isLoggedIn) return null;
  return {
    id: session.adminId,
    username: session.adminUsername,
  };
}

export async function logoutAdmin() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}