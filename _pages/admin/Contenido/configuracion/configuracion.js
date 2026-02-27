"use client";

import { useEffect, useRef, useState } from "react";
import { getConfiguracion, guardarConfiguracion } from "./servidor";
import styles from "./configuracion.module.css";

const FORM_INICIAL = {
  whatsapp_numero: "",
  hero_titulo: "",
  hero_subtitulo: "",
  footer_texto: "",
  instagram_url: "",
  facebook_url: "",
  email: "",
};

export default function Configuracion() {
  const formRef = useRef(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    async function cargar() {
      const data = await getConfiguracion();
      setForm((prev) => ({ ...prev, ...data }));
      setCargando(false);
    }
    cargar();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setExito(false);
    setGuardando(true);
    const fd = new FormData(formRef.current);
    await guardarConfiguracion(fd);
    setGuardando(false);
    setExito(true);
    setTimeout(() => setExito(false), 3000);
  }

  if (cargando) {
    return (
      <div className={styles.loadingState}>
        <ion-icon name="hourglass-outline" />
        <p>Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.titulo}>Configuración</h1>
          <p className={styles.subtitulo}>Ajustes generales del sitio</p>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className={styles.formGrid}>

        <div className={styles.formCol}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <ion-icon name="chatbubble-ellipses-outline" />
              Contacto
            </h2>

            <div className={styles.field}>
              <label className={styles.label}>Número de WhatsApp</label>
              <div className={styles.inputWrap}>
                <ion-icon name="logo-whatsapp" />
                <input
                  name="whatsapp_numero"
                  className={styles.input}
                  value={form.whatsapp_numero}
                  onChange={handleChange}
                  placeholder="Ej: 5491112345678"
                />
              </div>
              <small className={styles.hint}>Código de país + número sin espacios ni guiones.</small>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Email de contacto</label>
              <div className={styles.inputWrap}>
                <ion-icon name="mail-outline" />
                <input
                  name="email"
                  type="email"
                  className={styles.input}
                  value={form.email}
                  onChange={handleChange}
                  placeholder="contacto@ejemplo.com"
                />
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <ion-icon name="share-social-outline" />
              Redes sociales
            </h2>

            <div className={styles.field}>
              <label className={styles.label}>Instagram</label>
              <div className={styles.inputWrap}>
                <ion-icon name="logo-instagram" />
                <input
                  name="instagram_url"
                  className={styles.input}
                  value={form.instagram_url}
                  onChange={handleChange}
                  placeholder="https://instagram.com/tuusuario"
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Facebook</label>
              <div className={styles.inputWrap}>
                <ion-icon name="logo-facebook" />
                <input
                  name="facebook_url"
                  className={styles.input}
                  value={form.facebook_url}
                  onChange={handleChange}
                  placeholder="https://facebook.com/tupagina"
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.formCol}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <ion-icon name="home-outline" />
              Hero principal
            </h2>

            <div className={styles.field}>
              <label className={styles.label}>Título</label>
              <input
                name="hero_titulo"
                className={styles.inputPlain}
                value={form.hero_titulo}
                onChange={handleChange}
                placeholder="Ej: Los mejores precios en tecnología Apple"
              />
              <small className={styles.hint}>{form.hero_titulo.length} caracteres</small>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Subtítulo</label>
              <textarea
                name="hero_subtitulo"
                className={styles.textarea}
                value={form.hero_subtitulo}
                onChange={handleChange}
                placeholder="Descripción breve debajo del título..."
                rows={3}
              />
              <small className={styles.hint}>{form.hero_subtitulo.length} caracteres</small>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <ion-icon name="layers-outline" />
              Footer
            </h2>

            <div className={styles.field}>
              <label className={styles.label}>Texto del footer</label>
              <textarea
                name="footer_texto"
                className={styles.textarea}
                value={form.footer_texto}
                onChange={handleChange}
                placeholder="Texto que aparece en el pie de página..."
                rows={3}
              />
            </div>
          </div>

          <div className={styles.previewCard}>
            <p className={styles.previewLabel}>
              <ion-icon name="eye-outline" />
              Vista previa del hero
            </p>
            <div className={styles.preview}>
              <strong>{form.hero_titulo || "Título del hero"}</strong>
              <span>{form.hero_subtitulo || "Subtítulo del hero"}</span>
            </div>
          </div>

          {exito && (
            <div className={styles.alertExito}>
              <ion-icon name="checkmark-circle-outline" />
              Configuración guardada correctamente.
            </div>
          )}

          <button type="submit" className={styles.btnGuardar} disabled={guardando}>
            {guardando ? (
              <><ion-icon name="hourglass-outline" /> Guardando...</>
            ) : (
              <><ion-icon name="save-outline" /> Guardar configuración</>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}