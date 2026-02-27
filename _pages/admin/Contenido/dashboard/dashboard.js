"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getDashboardStats,
  getUltimosProductos,
  getProductosSinStock,
} from "./servidor";
import styles from "./dashboard.module.css";

const IMAGE_BASE = process.env.NEXT_PUBLIC_UPLOADS_URL || "/uploads";

const BADGE_TIPO = {
  nuevo:  { label: "Nuevo",   cls: "badgeNuevo" },
  pro:    { label: "Pro",     cls: "badgePro" },
  usado:  { label: "Usado",   cls: "badgeUsado" },
  oferta: { label: "Oferta",  cls: "badgeOferta" },
};

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [ultimos, setUltimos] = useState([]);
  const [sinStock, setSinStock] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      const [s, u, ss] = await Promise.all([
        getDashboardStats(),
        getUltimosProductos(),
        getProductosSinStock(),
      ]);
      setStats(s);
      setUltimos(u);
      setSinStock(ss);
      setCargando(false);
    }
    cargar();
  }, []);

  if (cargando) {
    return (
      <div className={styles.loadingWrap}>
        <ion-icon name="hourglass-outline" />
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  const CARDS = [
    {
      label: "Total productos",
      value: stats.totalProductos,
      icon: "phone-portrait-outline",
      cls: "cardBlue",
    },
    {
      label: "Categorías activas",
      value: stats.totalCategorias,
      icon: "folder-outline",
      cls: "cardGold",
    },
    {
      label: "Sin stock",
      value: stats.sinStock,
      icon: "alert-circle-outline",
      cls: stats.sinStock > 0 ? "cardRed" : "cardGreen",
    },
    {
      label: "Destacados",
      value: stats.destacados,
      icon: "star-outline",
      cls: "cardPurple",
    },
    {
      label: "Precio promedio",
      value: `USD ${Number(stats.precioPromedio).toLocaleString("es-AR")}`,
      icon: "cash-outline",
      cls: "cardGreen",
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.titulo}>Dashboard</h1>
          <p className={styles.subtitulo}>Resumen general del panel</p>
        </div>
        <button
          className={styles.btnNuevo}
          onClick={() => router.push("/admin/productos/nuevo")}
        >
          <ion-icon name="add-outline" />
          Nuevo producto
        </button>
      </div>

      <div className={styles.statsGrid}>
        {CARDS.map((c) => (
          <div key={c.label} className={`${styles.statCard} ${styles[c.cls]}`}>
            <div className={styles.statIcon}>
              <ion-icon name={c.icon} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>{c.label}</span>
              <strong className={styles.statValue}>{c.value}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.tablesGrid}>
        <section className={styles.tableSection}>
          <div className={styles.sectionHeader}>
            <h2>
              <ion-icon name="time-outline" />
              Últimos productos
            </h2>
            <button
              className={styles.btnVerTodos}
              onClick={() => router.push("/admin/productos")}
            >
              Ver todos
              <ion-icon name="arrow-forward-outline" />
            </button>
          </div>
          {ultimos.length === 0 ? (
            <div className={styles.emptyState}>
              <ion-icon name="cube-outline" />
              <p>No hay productos aún</p>
            </div>
          ) : (
            <ul className={styles.prodList}>
              {ultimos.map((p) => (
                <li key={p.id} className={styles.prodItem}>
                  <div className={styles.prodImg}>
                    <img
                      src={`${IMAGE_BASE}/${p.imagen_principal}`}
                      alt={p.nombre}
                    />
                  </div>
                  <div className={styles.prodInfo}>
                    <strong>{p.nombre}</strong>
                    <span>{p.storage} · {p.categoria_nombre}</span>
                  </div>
                  <div className={styles.prodMeta}>
                    <span className={`${styles.badge} ${styles[BADGE_TIPO[p.badge_tipo]?.cls || "badgeNuevo"]}`}>
                      {BADGE_TIPO[p.badge_tipo]?.label || p.badge_tipo}
                    </span>
                    <strong className={styles.precio}>
                      USD {Number(p.precio_usd).toLocaleString("es-AR")}
                    </strong>
                  </div>
                  <button
                    className={styles.btnEditar}
                    onClick={() => router.push(`/admin/productos/${p.id}`)}
                    aria-label="Editar"
                  >
                    <ion-icon name="pencil-outline" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.tableSection}>
          <div className={styles.sectionHeader}>
            <h2>
              <ion-icon name="alert-circle-outline" />
              Sin stock
            </h2>
            {sinStock.length > 0 && (
              <span className={styles.sinStockCount}>{sinStock.length}</span>
            )}
          </div>
          {sinStock.length === 0 ? (
            <div className={`${styles.emptyState} ${styles.emptyGreen}`}>
              <ion-icon name="checkmark-circle-outline" />
              <p>Todo en stock</p>
            </div>
          ) : (
            <ul className={styles.prodList}>
              {sinStock.map((p) => (
                <li key={p.id} className={`${styles.prodItem} ${styles.prodItemRed}`}>
                  <div className={styles.prodImg}>
                    <img
                      src={`${IMAGE_BASE}/${p.imagen_principal}`}
                      alt={p.nombre}
                    />
                  </div>
                  <div className={styles.prodInfo}>
                    <strong>{p.nombre}</strong>
                    <span>{p.storage} · {p.categoria_nombre}</span>
                  </div>
                  <div className={styles.prodMeta}>
                    <span className={styles.sinStockTag}>
                      <ion-icon name="close-circle-outline" />
                      Sin stock
                    </span>
                    <strong className={styles.precio}>
                      USD {Number(p.precio_usd).toLocaleString("es-AR")}
                    </strong>
                  </div>
                  <button
                    className={styles.btnEditar}
                    onClick={() => router.push(`/admin/productos/${p.id}`)}
                    aria-label="Editar"
                  >
                    <ion-icon name="pencil-outline" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}