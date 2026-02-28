"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCategorias, getConfigSitio, buscarProductos } from "./servidor";
import styles from "./header.module.css";

const IMAGE_BASE = process.env.NEXT_PUBLIC_UPLOADS_URL || "/uploads";

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const catActiva = searchParams.get("cat");

  const trackRef = useRef(null);
  const wrapRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchWrapRef = useRef(null);

  const [categorias, setCategorias] = useState([]);
  const [config, setConfig] = useState({});
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    async function cargarDatos() {
      const [cats, cfg] = await Promise.all([getCategorias(), getConfigSitio()]);
      setCategorias(cats);
      setConfig(cfg);
    }
    cargarDatos();
  }, []);

  const waNum = config?.whatsapp_numero;
  const waLink = waNum ? `https://wa.me/${waNum}` : null;

  function updateArrows() {
    const t = trackRef.current;
    if (!t) return;
    setAtStart(t.scrollLeft <= 4);
    setAtEnd(t.scrollLeft + t.clientWidth >= t.scrollWidth - 4);
    setHasOverflow(t.scrollWidth > t.clientWidth + 8);
  }

  useEffect(() => {
    const t = trackRef.current;
    if (!t) return;
    t.addEventListener("scroll", updateArrows);
    window.addEventListener("resize", updateArrows);
    setTimeout(updateArrows, 400);
    return () => {
      t.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [categorias]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 50);
    }
    if (!searchOpen) {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [searchOpen]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        if (searchOpen) closeSearch();
        if (mobileOpen) setMobileOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [searchOpen, mobileOpen]);

  useEffect(() => {
    function onClickOut(e) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        closeSearch();
      }
    }
    if (searchOpen) document.addEventListener("mousedown", onClickOut);
    return () => document.removeEventListener("mousedown", onClickOut);
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const debounceRef = useRef(null);
  function handleSearchChange(e) {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(debounceRef.current);
    if (val.trim().length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    debounceRef.current = setTimeout(async () => {
      const res = await buscarProductos(val.trim());
      setSearchResults(res);
      setSearchLoading(false);
    }, 320);
  }

  function closeSearch() {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  }

  function goToProduct(id) {
    closeSearch();
    setMobileOpen(false);
    router.push(`/detalles/${id}`);
  }

  function scrollTrack(dir) {
    if (trackRef.current) trackRef.current.scrollLeft += dir * 220;
  }

  function handleCat(slug) {
    router.push(`/?cat=${slug}`);
    setMobileOpen(false);
  }

  const showDropdown = searchOpen && (searchLoading || searchQuery.trim().length >= 2);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.topbar}>
          <div className={styles.logo}>
            <button onClick={() => router.push("/")} className={styles.logoBtn} aria-label="Ir al inicio">
              <img src="/logo.png" alt="M Importaciones" />
            </button>
          </div>

          <div
            ref={wrapRef}
            className={`${styles.navScrollWrap} ${atStart ? styles.atStart : ""} ${atEnd ? styles.atEnd : ""}`}
          >
            <button
              className={`${styles.navArrow} ${styles.left} ${hasOverflow && !atStart ? styles.visible : ""}`}
              onClick={() => scrollTrack(-1)}
              aria-label="Anterior"
            >
              <ion-icon name="chevron-back-outline" />
            </button>

            <nav ref={trackRef} className={styles.navbarTrack}>
              {categorias.map((cat) => (
                <button
                  key={cat.slug}
                  className={`${styles.catBtn} ${catActiva === cat.slug ? styles.active : ""}`}
                  onClick={() => handleCat(cat.slug)}
                >
                  <ion-icon name={cat.icono} />
                  {cat.nombre}
                </button>
              ))}
            </nav>

            <button
              className={`${styles.navArrow} ${styles.right} ${hasOverflow && !atEnd ? styles.visible : ""}`}
              onClick={() => scrollTrack(1)}
              aria-label="Siguiente"
            >
              <ion-icon name="chevron-forward-outline" />
            </button>
          </div>

          <div className={styles.topbarRight}>
            <div ref={searchWrapRef} className={`${styles.searchContainer} ${styles.desktopOnly}`}>
              <button
                className={`${styles.btnIcon} ${searchOpen ? styles.active : ""}`}
                onClick={() => setSearchOpen((v) => !v)}
                aria-label="Buscar"
              >
                <ion-icon name={searchOpen ? "close-outline" : "search-outline"} />
              </button>

              <div className={`${styles.searchDropdownWrap} ${searchOpen ? styles.open : ""}`}>
                <div className={styles.searchBarInner}>
                  <ion-icon name="search-outline" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Buscar producto..."
                    className={styles.searchInput}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    autoComplete="off"
                  />
                  {searchQuery && (
                    <button
                      className={styles.searchClear}
                      onClick={() => { setSearchQuery(""); setSearchResults([]); searchInputRef.current?.focus(); }}
                      aria-label="Limpiar"
                    >
                      <ion-icon name="close-circle-outline" />
                    </button>
                  )}
                </div>

                {showDropdown && (
                  <div className={styles.searchResults}>
                    {searchLoading ? (
                      <div className={styles.searchMsg}>
                        <ion-icon name="hourglass-outline" />
                        <span>Buscando...</span>
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className={styles.searchMsg}>
                        <ion-icon name="search-outline" />
                        <span>Sin resultados para <strong>"{searchQuery}"</strong></span>
                      </div>
                    ) : (
                      <>
                        <p className={styles.searchCount}>{searchResults.length} resultado{searchResults.length !== 1 ? "s" : ""}</p>
                        <ul className={styles.searchList}>
                          {searchResults.map((p) => (
                            <li key={p.id}>
                              <button className={styles.searchItem} onClick={() => goToProduct(p.id)}>
                                <div className={styles.searchItemImg}>
                                  <img src={`${IMAGE_BASE}/${p.imagen_principal}`} alt={p.nombre} />
                                </div>
                                <div className={styles.searchItemInfo}>
                                  <span className={styles.searchItemCat}>{p.categoria_nombre}</span>
                                  <strong className={styles.searchItemNombre}>{p.nombre}</strong>
                                  <span className={styles.searchItemSub}>{p.storage}</span>
                                </div>
                                <div className={styles.searchItemRight}>
                                  <strong className={styles.searchItemPrecio}>
                                    USD {Number(p.precio_usd).toLocaleString("es-AR")}
                                  </strong>
                                  <span className={styles.searchItemVer}>
                                    <ion-icon name="arrow-forward-outline" />
                                    Ver
                                  </span>
                                </div>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {waLink && (
              <a
                href={waLink}
                className={styles.btnWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ion-icon name="logo-whatsapp" />
                <span>WhatsApp</span>
              </a>
            )}
            <button
              className={styles.mobileMenuBtn}
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
            >
              <ion-icon name="menu-outline" />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`${styles.mobileNavOverlay} ${mobileOpen ? styles.open : ""}`}
        onClick={(e) => { if (e.target === e.currentTarget) setMobileOpen(false); }}
      >
        <div className={styles.mobileNavInner}>
          <div className={styles.mobileNavHeader}>
            <img src="/logo.png" alt="M Importaciones" />
            <button className={styles.mobileCloseBtn} onClick={() => setMobileOpen(false)} aria-label="Cerrar menu">
              <ion-icon name="close-outline" />
            </button>
          </div>

          <div className={styles.mobileSearchWrap}>
            <div className={styles.searchWrapper}>
              <ion-icon name="search-outline" />
              <input
                type="text"
                placeholder="Buscar producto..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={handleSearchChange}
                autoComplete="off"
              />
              {searchQuery && (
                <button className={styles.searchClear} onClick={() => { setSearchQuery(""); setSearchResults([]); }} aria-label="Limpiar">
                  <ion-icon name="close-circle-outline" />
                </button>
              )}
            </div>
            {searchQuery.trim().length >= 2 && (
              <div className={styles.mobileSearchResults}>
                {searchLoading ? (
                  <div className={styles.searchMsg}><ion-icon name="hourglass-outline" /><span>Buscando...</span></div>
                ) : searchResults.length === 0 ? (
                  <div className={styles.searchMsg}><ion-icon name="search-outline" /><span>Sin resultados para <strong>"{searchQuery}"</strong></span></div>
                ) : (
                  <>
                    <p className={styles.searchCount}>{searchResults.length} resultado{searchResults.length !== 1 ? "s" : ""}</p>
                    <ul className={styles.searchList}>
                      {searchResults.map((p) => (
                        <li key={p.id}>
                          <button className={styles.searchItem} onClick={() => goToProduct(p.id)}>
                            <div className={styles.searchItemImg}>
                              <img src={`${IMAGE_BASE}/${p.imagen_principal}`} alt={p.nombre} />
                            </div>
                            <div className={styles.searchItemInfo}>
                              <span className={styles.searchItemCat}>{p.categoria_nombre}</span>
                              <strong className={styles.searchItemNombre}>{p.nombre}</strong>
                              <span className={styles.searchItemSub}>{p.storage}</span>
                            </div>
                            <div className={styles.searchItemRight}>
                              <strong className={styles.searchItemPrecio}>USD {Number(p.precio_usd).toLocaleString("es-AR")}</strong>
                              <span className={styles.searchItemVer}><ion-icon name="arrow-forward-outline" />Ver</span>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>

          <nav className={styles.mobileNavLinks}>
            {categorias.map((cat) => (
              <button
                key={cat.slug}
                className={`${styles.mobCatBtn} ${catActiva === cat.slug ? styles.active : ""}`}
                onClick={() => handleCat(cat.slug)}
              >
                <ion-icon name={cat.icono} />
                {cat.nombre}
              </button>
            ))}
          </nav>

          {waLink && (
            <a href={waLink} className={`${styles.btnWhatsapp} ${styles.mobileWa}`} target="_blank" rel="noopener noreferrer">
              <ion-icon name="logo-whatsapp" />
              Contactar por WhatsApp
            </a>
          )}
        </div>
      </div>
    </>
  );
}