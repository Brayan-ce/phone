import Login from "@/_pages/admin/login/login";

export const metadata = {
  title: "Iniciar sesión | M Importaciones",
  description: "Acceso al panel de administración de M Importaciones.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <Login />;
}