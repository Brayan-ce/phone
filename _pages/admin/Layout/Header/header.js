"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { logoutAdmin } from "@/_pages/admin/login/servidor";
import styles from "./header.module.css";

const NAV = [
  { label: "Dashboard",    icon: "grid-outline",         href: "/admin" },
  { label: "Productos",    icon: "phone-portrait-outline", href: "/admin/productos" },
  { label: "Categorías",   icon: "folder-outline",        href: "/admin/categorias" },
  { label: "Configuración",icon: "settings-outline",      href: "/admin/configuracion" },
];

export default function HeaderAdmin() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  function isActive(href) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  async function handleLogout() {
    setLoggingOut(true);
    await logoutAdmin();
  }

  return (
    <>
      <button
        className={styles.mobileToggle}
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú"
      >
        <ion-icon name="menu-outline" />
      </button>

      {mobileOpen && (
        <div
          className={styles.overlay}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          ${styles.sidebar}
          ${collapsed ? styles.collapsed : ""}
          ${mobileOpen ? styles.mobileOpen : ""}
        `}
      >
        <div className={styles.sidebarTop}>
          <div className={styles.brand}>
            {!collapsed && (
              <img src="/logo.png" alt="M Importaciones" className={styles.logo} />
            )}
            {collapsed && (
              <div className={styles.logoMini}>
                <ion-icon name="storefront-outline" />
              </div>
            )}
          </div>

          <button
            className={styles.collapseBtn}
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          >
            <ion-icon name={collapsed ? "chevron-forward-outline" : "chevron-back-outline"} />
          </button>
        </div>

        <nav className={styles.nav}>
          {NAV.map((item) => (
            <button
              key={item.href}
              className={`${styles.navBtn} ${isActive(item.href) ? styles.active : ""}`}
              onClick={() => router.push(item.href)}
              title={collapsed ? item.label : ""}
            >
              <ion-icon name={item.icon} />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && isActive(item.href) && (
                <span className={styles.activeDot} />
              )}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={`${styles.divider} ${collapsed ? styles.dividerCollapsed : ""}`} />
          <button
            className={`${styles.navBtn} ${styles.logoutBtn}`}
            onClick={handleLogout}
            disabled={loggingOut}
            title={collapsed ? "Cerrar sesión" : ""}
          >
            <ion-icon name={loggingOut ? "hourglass-outline" : "log-out-outline"} />
            {!collapsed && <span>{loggingOut ? "Saliendo..." : "Cerrar sesión"}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}