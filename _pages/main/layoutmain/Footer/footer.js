"use client";

import { useEffect, useState } from "react";
import { getFooterData } from "./servidor";
import styles from "./footer.module.css";

export default function Footer() {
  const [categorias, setCategorias] = useState([]);
  const [config, setConfig] = useState({});

  useEffect(() => {
    async function cargar() {
      const { categorias: cats, config: cfg } = await getFooterData();
      setCategorias(cats);
      setConfig(cfg);
    }
    cargar();
  }, []);

  const waNum = config?.whatsapp_numero || "TUNUMERO";
  const anio = new Date().getFullYear();

  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <img src="/logo.png" alt="M Importaciones" />
            <p>{config?.footer_texto || "Los mejores precios en tecnologia Apple con stock garantizado."}</p>
          </div>

          <div className={styles.footerNav}>
            <h5>Categorias</h5>
            <ul>
              {categorias.map((cat) => (
                <li key={cat.slug}>
                  <a href={`#${cat.slug}`}>{cat.nombre}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.footerContact}>
            <h5>Contacto</h5>
            <a
              href={`https://wa.me/${waNum}`}
              className={styles.footerWa}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ion-icon name="logo-whatsapp" />
              WhatsApp
            </a>
            <div className={styles.footerSocial}>
              <a
                href={config?.instagram_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <ion-icon name="logo-instagram" />
              </a>
              <a
                href={config?.email ? `mailto:${config.email}` : "#"}
                aria-label="Email"
              >
                <ion-icon name="mail-outline" />
              </a>
              <a
                href={config?.facebook_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <ion-icon name="logo-facebook" />
              </a>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>M Importaciones &copy; {anio}. Todos los derechos reservados.</p>
        </div>
      </footer>

      <a
        href={`https://wa.me/${waNum}`}
        className={styles.fabWhatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
      >
        <ion-icon name="logo-whatsapp" />
      </a>
    </>
  );
}