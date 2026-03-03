"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFooterData } from "./servidor";
import styles from "./footer.module.css";

const NOMBRE_EMPRESA = "Rafaela tech";

export default function Footer() {
  const router = useRouter();
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

  const waNum = config?.whatsapp_numero;
  const waLink = waNum ? `https://wa.me/${waNum}` : null;
  const anio = new Date().getFullYear();

  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.footerInner}>

          <div className={styles.footerBrand}>
            <div className={styles.footerBrandTop}>
              <img
                src="/logo.png"
                alt={NOMBRE_EMPRESA}
                className={styles.footerLogo}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
              <p>{config?.footer_texto || "Los mejores precios en tecnologia Apple con stock garantizado."}</p>
            </div>
          </div>

          <div className={styles.footerNav}>
            <h5>Categorias</h5>
            <ul>
              {categorias.map((cat) => (
                <li key={cat.slug}>
                  <button onClick={() => router.push(`/?cat=${cat.slug}`)}>
                    <ion-icon name="chevron-forward-outline" />
                    {cat.nombre}
                  </button>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className={styles.footerBottom}>
          <p><span className={styles.marca}>{NOMBRE_EMPRESA}</span> &copy; {anio}. Todos los derechos reservados.</p>
        </div>
      </footer>

      {waLink && (
        <a href={waLink} className={styles.fabWhatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
          <ion-icon name="logo-whatsapp" />
        </a>
      )}
    </>
  );
}