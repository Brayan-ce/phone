"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProductos, eliminarProducto } from "./servidor";
import styles from "./productos.module.css";

const IMAGE_BASE = process.env.NEXT_PUBLIC_UPLOADS_URL || "/uploads";

const BADGE_CLS = {
  nuevo:  styles.badgeNuevo,
  pro:    styles.badgePro,
  usado:  styles.badgeUsado,
  oferta: styles.badgeOferta,
};

export default function Productos() {
  const router = useRouter();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [query, setQuery] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  async function cargar() {
    setCargando(true);
    const data = await getProductos();
    setProductos(data);
    setCargando(false);
  }

  useEffect(() => { cargar(); }, []);

  async function handleEliminar() {
    if (!confirmId) return;
    setEliminando(true);
    await eliminarProducto(confirmId);
    setConfirmId(null);
    setEliminando(false);
    await cargar();
  }

  const filtrados = query.trim()
    ? productos.filter((p) =>
        p.nombre.toLowerCase().includes(query.toLowerCase()) ||
        p.storage?.toLowerCase().includes(query.toLowerCase()) ||
        p.categoria_nombre.toLowerCase().includes(query.toLowerCase())
      )
    : productos;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.titulo}>Productos</h1>
          <p className={styles.subtitulo}>{productos.length} productos en total</p>
        </div>
        <button className={styles.btnNuevo} onClick={() => router.push("/admin/productos/nuevo")}>
          <ion-icon name="add-outline" />
          Nuevo producto
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <ion-icon name="search-outline" />
          <input
            type="text"
            placeholder="Buscar por nombre, storage, categoría..."
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          {query && (
            <button className={styles.clearBtn} onClick={() => setQuery("")}>
              <ion-icon name="close-circle-outline" />
            </button>
          )}
        </div>
        <span className={styles.resultCount}>{filtrados.length} resultados</span>
      </div>

      {cargando ? (
        <div className={styles.loadingState}>
          <ion-icon name="hourglass-outline" />
          <p>Cargando productos...</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className={styles.emptyState}>
          <ion-icon name="cube-outline" />
          <p>No se encontraron productos</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Storage</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => (
                <tr key={p.id} className={!p.activo ? styles.rowInactiva : ""}>
                  <td>
                    <div className={styles.prodCell}>
                      <div className={styles.prodImg}>
                        <img src={`${IMAGE_BASE}/${p.imagen_principal}`} alt={p.nombre} />
                      </div>
                      <div className={styles.prodCellInfo}>
                        <strong>{p.nombre}</strong>
                        {p.badge && (
                          <span className={`${styles.badge} ${BADGE_CLS[p.badge_tipo] || styles.badgeNuevo}`}>
                            {p.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={styles.tdSub}>{p.categoria_nombre}</td>
                  <td className={styles.tdSub}>{p.storage || "—"}</td>
                  <td>
                    <strong className={styles.precio}>
                      USD {Number(p.precio_usd).toLocaleString("es-AR")}
                    </strong>
                  </td>
                  <td>
                    <span className={`${styles.stockTag} ${p.stock === 0 ? styles.stockCero : ""}`}>
                      {p.stock === 0 ? "Sin stock" : `${p.stock} u.`}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.estadoTag} ${p.activo ? styles.estadoActivo : styles.estadoInactivo}`}>
                      {p.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.acciones}>
                      <button
                        className={styles.btnAccion}
                        onClick={() => router.push(`/admin/productos/${p.id}`)}
                        title="Editar"
                      >
                        <ion-icon name="pencil-outline" />
                      </button>
                      <button
                        className={`${styles.btnAccion} ${styles.btnDanger}`}
                        onClick={() => setConfirmId(p.id)}
                        title="Eliminar"
                      >
                        <ion-icon name="trash-outline" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmId && (
        <div className={styles.modalOverlay} onClick={() => setConfirmId(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>
              <ion-icon name="trash-outline" />
            </div>
            <h3>¿Eliminar producto?</h3>
            <p>El producto quedará inactivo y no se mostrará en la tienda. Podés reactivarlo editándolo.</p>
            <div className={styles.modalBtns}>
              <button className={styles.btnCancelar} onClick={() => setConfirmId(null)} disabled={eliminando}>
                Cancelar
              </button>
              <button className={styles.btnConfirmar} onClick={handleEliminar} disabled={eliminando}>
                {eliminando ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}