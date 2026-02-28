"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getProductosConColores, getConfigHero } from "./servidor";
import styles from "./contenido.module.css";

const IMAGE_BASE = process.env.NEXT_PUBLIC_UPLOADS_URL || "/uploads";

export default function Contenido() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const catActiva = searchParams.get("cat") || "nuevos";
  const pageActual = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const esHome = pathname === "/" && !searchParams.get("cat");

  const [productos, setProductos] = useState([]);
  const [config, setConfig] = useState({});
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState("asc");
  const [query, setQuery] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    getConfigHero().then(setConfig);
  }, []);

  useEffect(() => {
    setCargando(true);
    setQuery("");
    setProductos([]);
    getProductosConColores(catActiva, pageActual).then((res) => {
      setProductos(Array.isArray(res.productos) ? res.productos : []);
      setTotalPages(res.totalPages || 1);
      setTotal(res.total || 0);
      setCargando(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, [catActiva, pageActual]);

  const waNum = config?.whatsapp_numero;
  const waLink = waNum ? `https://wa.me/${waNum}` : null;

  function getProductosFiltrados() {
    let lista = [...productos];
    if (query.trim()) {
      lista = lista.filter((p) =>
        p.nombre.toLowerCase().includes(query.toLowerCase())
      );
    }
    if (sort === "asc") lista.sort((a, b) => a.precio_usd - b.precio_usd);
    if (sort === "desc") lista.sort((a, b) => b.precio_usd - a.precio_usd);
    if (sort === "az") lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
    return lista;
  }

  function consultarWhatsapp(p) {
    if (!waLink) return;
    const msg = encodeURIComponent(
      `Hola, me interesa consultar sobre: ${p.nombre.toUpperCase()} ${p.storage} - USD $${p.precio_usd}`
    );
    window.open(`${waLink}?text=${msg}`, "_blank", "noopener,noreferrer");
  }

  function goToPage(p) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", p);
    router.push(`${pathname}?${params.toString()}`);
  }

  function getPaginasMostradas() {
    const paginas = [];
    const delta = 2;
    const left = Math.max(1, pageActual - delta);
    const right = Math.min(totalPages, pageActual + delta);
    if (left > 1) {
      paginas.push(1);
      if (left > 2) paginas.push("...");
    }
    for (let i = left; i <= right; i++) paginas.push(i);
    if (right < totalPages) {
      if (right < totalPages - 1) paginas.push("...");
      paginas.push(totalPages);
    }
    return paginas;
  }

  const filtrados = getProductosFiltrados();

  return (
    <>
      {esHome && (
        <section className={styles.heroBanner}>
          <div className={styles.heroContent}>
            <span className={styles.heroTag}>Stock actualizado</span>
            <h1>{config?.hero_titulo || "Los mejores precios en tecnologia Apple"}</h1>
            <p className={styles.heroSub}>
              {config?.hero_subtitulo || "Stock disponible para entrega inmediata. Precios sin competencia."}
            </p>
            <div className={styles.heroActions}>
              {waLink ? (
                <a href={waLink} className={styles.btnHeroPrimary} target="_blank" rel="noopener noreferrer">
                  <ion-icon name="logo-whatsapp" />
                  Consultar por WhatsApp
                </a>
              ) : (
                <span className={styles.btnHeroPrimary} style={{ opacity: 0.5, cursor: "default" }}>
                  <ion-icon name="logo-whatsapp" />
                  Consultar por WhatsApp
                </span>
              )}
            </div>
          </div>
          <div className={styles.heroChips}>
            <div className={styles.chip}>
              <ion-icon name="shield-checkmark-outline" />
              <div><strong>Originales</strong><span>100% garantizados</span></div>
            </div>
            <div className={styles.chip}>
              <ion-icon name="cube-outline" />
              <div><strong>Stock real</strong><span>Entrega inmediata</span></div>
            </div>
            <div className={styles.chip}>
              <ion-icon name="flash-outline" />
              <div><strong>Precios</strong><span>Competitivos</span></div>
            </div>
          </div>
        </section>
      )}

      <main className={styles.main}>
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <p className={styles.resultsCount}>
              <strong>{total}</strong> productos encontrados
            </p>
          </div>
          <div className={styles.toolbarRight}>
            <div className={styles.searchWrapper}>
              <ion-icon name="search-outline" />
              <input
                type="text"
                placeholder="Buscar producto..."
                className={styles.searchInput}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className={styles.filterGroup}>
              {[
                { key: "asc", icon: "arrow-up-outline", label: "Menor precio" },
                { key: "desc", icon: "arrow-down-outline", label: "Mayor precio" },
                { key: "az", icon: "text-outline", label: "A-Z" },
              ].map((f) => (
                <button
                  key={f.key}
                  className={`${styles.filterBtn} ${sort === f.key ? styles.active : ""}`}
                  onClick={() => setSort(f.key)}
                >
                  <ion-icon name={f.icon} />
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {cargando ? (
          <div className={styles.loadingState}>
            <ion-icon name="hourglass-outline" />
            <p>Cargando productos...</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className={styles.emptyState}>
            <ion-icon name="search-outline" />
            <p>No se encontraron productos</p>
          </div>
        ) : (
          <div className={styles.productsGrid}>
            {filtrados.map((p) => (
              <div
                key={p.id}
                className={`${styles.prodCard} ${p.badge_tipo === "pro" ? styles.pro : ""}`}
              >
                <div className={styles.prodImg}>
                  <img src={`${IMAGE_BASE}/${p.imagen_principal}`} alt={p.nombre} loading="lazy" />
                  <span className={`${styles.badge} ${p.badge_tipo === "pro" ? styles.proBadge : ""}`}>
                    {p.badge}
                  </span>
                  <div className={styles.imgOverlay}>
                    <button className={styles.btnQuick} onClick={() => router.push(`/detalles/${p.id}`)}>
                      <ion-icon name="eye-outline" />
                      Vista rapida
                    </button>
                  </div>
                </div>
                <div className={styles.prodBody}>
                  <span className={styles.prodSub}>{p.subtitulo}</span>
                  <h3>{p.storage}</h3>
                  <div className={styles.colores}>
                    {p.colores.map((c) => (
                      <span key={c.nombre} className={styles.colorTag} style={{ "--c": c.hex_color }}>
                        {c.nombre}
                      </span>
                    ))}
                  </div>
                  <div className={styles.prodFooter}>
                    <div className={styles.precio}>
                      <small>Precio</small>
                      <strong>USD {Number(p.precio_usd).toLocaleString("es-AR")}</strong>
                    </div>
                    <button
                      className={styles.btnConsultar}
                      onClick={() => consultarWhatsapp(p)}
                      disabled={!waLink}
                    >
                      <ion-icon name="chatbubble-ellipses-outline" />
                      Consultar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && !cargando && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              onClick={() => goToPage(pageActual - 1)}
              disabled={pageActual === 1}
            >
              <ion-icon name="chevron-back-outline" />
            </button>

            {getPaginasMostradas().map((p, i) =>
              p === "..." ? (
                <span key={`dots-${i}`} className={styles.pageDots}>...</span>
              ) : (
                <button
                  key={p}
                  className={`${styles.pageBtn} ${pageActual === p ? styles.pageActive : ""}`}
                  onClick={() => goToPage(p)}
                >
                  {p}
                </button>
              )
            )}

            <button
              className={styles.pageBtn}
              onClick={() => goToPage(pageActual + 1)}
              disabled={pageActual === totalPages}
            >
              <ion-icon name="chevron-forward-outline" />
            </button>
          </div>
        )}
      </main>

      <section className={styles.trustSection}>
        <div className={styles.trustInner}>
          {[
            { icon: "shield-checkmark-outline", titulo: "Originales garantizados", texto: "Todos nuestros equipos son 100% originales con garantia de fabrica." },
            { icon: "cube-outline", titulo: "Stock real disponible", texto: "Lo que ves en la lista esta disponible para entrega inmediata." },
            { icon: "headset-outline", titulo: "Atencion personalizada", texto: "Te asesoramos para encontrar el equipo ideal segun tu necesidad." },
            { icon: "flash-outline", titulo: "Precios competitivos", texto: "Encontra los mejores precios del mercado con stock garantizado." },
          ].map((item) => (
            <div key={item.titulo} className={styles.trustItem}>
              <ion-icon name={item.icon} />
              <h4>{item.titulo}</h4>
              <p>{item.texto}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}