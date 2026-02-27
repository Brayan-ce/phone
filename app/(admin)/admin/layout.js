import HeaderAdmin from "@/_pages/admin/Layout/Header/header";
import styles from "./admin.module.css";
export const metadata = {
  title: "Panel Admin | M Importaciones",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return (
    <div className={styles.adminWrap}>
      <HeaderAdmin />
      <main className={styles.adminMain}>
        {children}
      </main>
    </div>
  );
}