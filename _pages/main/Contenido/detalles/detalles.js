"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getProductoDetalle,
  getImagenesProducto,
  getColoresProducto,
  getRelacionados,
  getConfigWhatsapp,
} from "./servidor";
import styles from "./detalles.module.css";

export default function Detalles() {
  const { id } = useParams();
  const router = useRouter();

  const IMAGE_BASE = process.env.NEXT_PUBLIC_UPLOADS_URL || "/uploads";

  const [producto, setProducto] = useState(null);
  const [imagenes, setImagenes] = useState([]);
  const [colores, setColores] = useState([]);
  const [relacionados, setRelacionados] = useState([]);
  const [waNum, setWaNum] = useState("TUNUMERO");
  const [cargando, setCargando] = useState(true);
  const [imgActiva, setImgActiva] = useState(0);
  const [colorActivo, setColorActivo] = useState(null);
  const carruselRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    async function cargar() {
      setCargando(true);
      const prod = await getProductoDetalle(id);
      if (!prod) {
        setCargando(false);
        return;
      }
      const [imgs, cols, rel, wa] = await Promise.all([
        getImagenesProducto(id),
        getColoresProducto(id),
        getRelacionados(prod.categoria_slug, id),
        getConfigWhatsapp(),
      ]);
      setProducto(prod);
      setImagenes(imgs);
      setColores(cols);
      setRelacionados(rel);
      setWaNum(wa);
      setColorActivo(cols[0]?.nombre || null);
      setCargando(false);
    }
    cargar();
  }, [id]);

  function consultarWhatsapp() {
    if (!producto) return;
    const color = colorActivo ? ` - Color: ${colorActivo}` : "";
    const msg = encodeURIComponent(
      `Hola, me interesa consultar sobre: ${producto.nombre.toUpperCase()} ${producto.storage}${color} - USD $${producto.precio_usd}`
    );
    window.open(`https://wa.me/${waNum}?text=${msg}`, "_blank");
  }

  function prevImg() {
    setImgActiva((v) => (v === 0 ? imagenes.length - 1 : v - 1));
  }

  function nextImg() {
    setImgActiva((v) => (v === imagenes.length - 1 ? 0 : v + 1));
  }

  function scrollCarrusel(dir) {
    if (carruselRef.current) carruselRef.current.scrollLeft += dir * 280;
  }

  if (cargando) {
    return (
      <div className={styles.loadingState}>
        <ion-icon name="hourglass-outline" />
        <p>Cargando producto...</p>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className={styles.loadingState}>
        <ion-icon name="alert-circle-outline" />
        <p>Producto no encontrado</p>
        <button className={styles.btnVolver} onClick={() => router.push("/")}>
          <ion-icon name="arrow-back-outline" />
          Volver al inicio
        </button>
      </div>
    );
  }

  const imagenActual = imagenes[imgActiva];
  const srcActual = imagenActual
    ? `${IMAGE_BASE}/${imagenActual.nombre_archivo}`
    : `${IMAGE_BASE}/${producto.imagen_principal}`;

  return (
    <>
      <div className={styles.breadcrumb}>
        <button onClick={() => router.push("/")} className={styles.breadLink}>
          Inicio
        </button>
        <ion-icon name="chevron-forward-outline" />
        <button onClick={() => router.push("/")} className={styles.breadLink}>
          {producto.categoria_nombre}
        </button>
        <ion-icon name="chevron-forward-outline" />
        <span>{producto.nombre}</span>
      </div>

      <section className={styles.detalleWrap}>
        <div className={styles.galeria}>
          <div className={styles.galeriaMain}>
            {imagenes.length > 1 && (
              <button
                className={`${styles.galeriaArrow} ${styles.left}`}
                onClick={prevImg}
                aria-label="Anterior"
              >
                <ion-icon name="chevron-back-outline" />
              </button>
            )}
            <img
              src={srcActual}
              alt={imagenActual?.alt_texto || producto.nombre}
            />
            {imagenes.length > 1 && (
              <button
                className={`${styles.galeriaArrow} ${styles.right}`}
                onClick={nextImg}
                aria-label="Siguiente"
              >
                <ion-icon name="chevron-forward-outline" />
              </button>
            )}
            {producto.badge && (
              <span
                className={`${styles.badge} ${
                  producto.badge_tipo === "pro" ? styles.proBadge : ""
                }`}
              >
                {producto.badge}
              </span>
            )}
            {imagenes.length > 1 && (
              <div className={styles.galeriaIndicadores}>
                {imagenes.map((_, i) => (
                  <button
                    key={i}
                    className={`${styles.indicador} ${
                      i === imgActiva ? styles.active : ""
                    }`}
                    onClick={() => setImgActiva(i)}
                    aria-label={`Imagen ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {imagenes.length > 1 && (
            <div className={styles.galeriaThumbs}>
              {imagenes.map((img, i) => (
                <button
                  key={img.id}
                  className={`${styles.thumb} ${
                    i === imgActiva ? styles.active : ""
                  }`}
                  onClick={() => setImgActiva(i)}
                >
                  <img
                    src={`${IMAGE_BASE}/${img.nombre_archivo}`}
                    alt={img.alt_texto || producto.nombre}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.info}>
          <div className={styles.infoTop}>
            <span className={styles.categoria}>{producto.categoria_nombre}</span>
            <h1>{producto.nombre}</h1>
            <p className={styles.storage}>{producto.storage}</p>
          </div>

          {producto.descripcion && (
            <p className={styles.descripcion}>{producto.descripcion}</p>
          )}

          {colores.length > 0 && (
            <div className={styles.coloresWrap}>
              <p className={styles.coloresLabel}>
                Colores Disponibles: <strong>{colorActivo}</strong>
              </p>
              <div className={styles.colores}>
                {colores.map((c) => (
                  <button
                    key={c.nombre}
                    className={`${styles.colorBtn} ${
                      colorActivo === c.nombre
                    }`}
                    style={{ "--c": c.hex_color }}
                    title={c.nombre}
                    aria-label={c.nombre}
                  />
                ))}
              </div>
            </div>
          )}


          <div className={styles.precioWrap}>
            <small>Precio</small>
            <strong>
              USD {Number(producto.precio_usd).toLocaleString("es-AR")}
            </strong>
          </div>

          <div className={styles.acciones}>
            <button className={styles.btnConsultar} onClick={consultarWhatsapp}>
              <ion-icon name="logo-whatsapp" />
              Consultar por WhatsApp
            </button>
            <button className={styles.btnVolver} onClick={() => router.back()}>
              <ion-icon name="arrow-back-outline" />
              Volver
            </button>
          </div>

          <div className={styles.chips}>
            <div className={styles.chip}>
              <ion-icon name="shield-checkmark-outline" />
              <span>Original garantizado</span>
            </div>
            <div className={styles.chip}>
              <ion-icon name="flash-outline" />
              <span>Entrega inmediata</span>
            </div>
            <div className={styles.chip}>
              <ion-icon name="cube-outline" />
              <span>Stock real</span>
            </div>
          </div>
        </div>
      </section>

      {relacionados.length > 0 && (
        <section className={styles.relacionados}>
          <div className={styles.relacionadosHeader}>
            <h2>Productos relacionados</h2>
            <div className={styles.carruselControles}>
              <button onClick={() => scrollCarrusel(-1)} aria-label="Anterior">
                <ion-icon name="chevron-back-outline" />
              </button>
              <button onClick={() => scrollCarrusel(1)} aria-label="Siguiente">
                <ion-icon name="chevron-forward-outline" />
              </button>
            </div>
          </div>

          <div className={styles.carrusel} ref={carruselRef}>
            {relacionados.map((p) => (
              <div
                key={p.id}
                className={`${styles.relCard} ${
                  p.badge_tipo === "pro" ? styles.pro : ""
                }`}
                onClick={() => router.push(`/detalles/${p.id}`)}
              >
                <div className={styles.relImg}>
                  <img
                    src={`${IMAGE_BASE}/${p.imagen_principal}`}
                    alt={p.nombre}
                    loading="lazy"
                  />
                  {p.badge && (
                    <span
                      className={`${styles.badge} ${
                        p.badge_tipo === "pro" ? styles.proBadge : ""
                      }`}
                    >
                      {p.badge}
                    </span>
                  )}
                </div>
                <div className={styles.relBody}>
                  <span className={styles.relSub}>{p.subtitulo}</span>
                  <h3>{p.storage}</h3>
                  <div className={styles.relFooter}>
                    <strong>
                      USD {Number(p.precio_usd).toLocaleString("es-AR")}
                    </strong>
                    <span className={styles.verBtn}>
                      <ion-icon name="eye-outline" />
                      Ver
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}