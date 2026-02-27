"use client";

import { useEffect, useRef, useState } from "react";
import {
  getCategorias,
  crearCategoria,
  editarCategoria,
  toggleActivaCategoria,
} from "./servidor";
import styles from "./categorias.module.css";

const ICONOS_SUGERIDOS = [
  "phone-portrait-outline",
  "refresh-outline",
  "laptop-outline",
  "watch-outline",
  "headset-outline",
  "logo-android",
  "tablet-portrait-outline",
  "desktop-outline",
  "camera-outline",
  "game-controller-outline",
  "tv-outline",
  "bluetooth-outline",
  "wifi-outline",
  "cube-outline",
  "storefront-outline",
];

const FORM_INICIAL = {
  slug: "",
  nombre: "",
  icono: "cube-outline",
  orden: "0",
  activa: "1",
};

export default function Categorias() {
  const formRef = useRef(null);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  async function cargar() {
    setCargando(true);
    const data = await getCategorias();
    setCategorias(data);
    setCargando(false);
  }

  useEffect(() => { cargar(); }, []);

  function abrirNueva() {
    setEditandoId(null);
    setForm(FORM_INICIAL);
    setError("");
    setExito("");
    setModalAbierto(true);
  }

  function abrirEditar(cat) {
    setEditandoId(cat.id);
    setForm({
      slug:   cat.slug,
      nombre: cat.nombre,
      icono:  cat.icono || "cube-outline",
      orden:  String(cat.orden),
      activa: cat.activa ? "1" : "0",
    });
    setError("");
    setExito("");
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setEditandoId(null);
    setForm(FORM_INICIAL);
    setError("");
    setExito("");
    setIconPickerOpen(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "nombre" && !editandoId) {
        next.slug = value.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      }
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setExito("");
    setGuardando(true);

    const fd = new FormData(formRef.current);
    if (editandoId) fd.set("id", editandoId);

    const result = editandoId
      ? await editarCategoria(fd)
      : await crearCategoria(fd);

    if (result?.error) {
      setError(result.error);
      setGuardando(false);
      return;
    }

    setExito(editandoId ? "Categoría actualizada." : "Categoría creada.");
    setGuardando(false);
    await cargar();
    setTimeout(cerrarModal, 900);
  }

  async function handleToggle(cat) {
    await toggleActivaCategoria(cat.id, !cat.activa);
    await cargar();
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.titulo}>Categorías</h1>
          <p className={styles.subtitulo}>{categorias.length} categorías en total</p>
        </div>
        <button className={styles.btnNuevo} onClick={abrirNueva}>
          <ion-icon name="add-outline" />
          Nueva categoría
        </button>
      </div>

      {cargando ? (
        <div className={styles.loadingState}>
          <ion-icon name="hourglass-outline" />
          <p>Cargando categorías...</p>
        </div>
      ) : categorias.length === 0 ? (
        <div className={styles.emptyState}>
          <ion-icon name="folder-outline" />
          <p>No hay categorías aún</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {categorias.map((cat) => (
            <div
              key={cat.id}
              className={`${styles.catCard} ${!cat.activa ? styles.inactiva : ""}`}
            >
              <div className={styles.catCardTop}>
                <div className={styles.catIconWrap}>
                  <ion-icon name={cat.icono || "cube-outline"} />
                </div>
                <div className={styles.catMeta}>
                  <strong className={styles.catNombre}>{cat.nombre}</strong>
                  <span className={styles.catSlug}>/{cat.slug}</span>
                </div>
                <span className={`${styles.estadoTag} ${cat.activa ? styles.estadoActivo : styles.estadoInactivo}`}>
                  {cat.activa ? "Activa" : "Inactiva"}
                </span>
              </div>

              <div className={styles.catStats}>
                <div className={styles.stat}>
                  <ion-icon name="phone-portrait-outline" />
                  <span>{cat.total_productos} productos</span>
                </div>
                <div className={styles.stat}>
                  <ion-icon name="reorder-four-outline" />
                  <span>Orden: {cat.orden}</span>
                </div>
              </div>

              <div className={styles.catAcciones}>
                <button className={styles.btnEditar} onClick={() => abrirEditar(cat)}>
                  <ion-icon name="pencil-outline" />
                  Editar
                </button>
                <button
                  className={`${styles.btnToggle} ${cat.activa ? styles.btnDesactivar : styles.btnActivar}`}
                  onClick={() => handleToggle(cat)}
                >
                  <ion-icon name={cat.activa ? "eye-off-outline" : "eye-outline"} />
                  {cat.activa ? "Desactivar" : "Activar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalAbierto && (
        <div className={styles.overlay} onClick={cerrarModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editandoId ? "Editar categoría" : "Nueva categoría"}</h2>
              <button className={styles.btnCerrar} onClick={cerrarModal} aria-label="Cerrar">
                <ion-icon name="close-outline" />
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Nombre *</label>
                <input
                  name="nombre"
                  className={styles.input}
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej: iPhone Nuevos"
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Slug *</label>
                <input
                  name="slug"
                  className={styles.input}
                  value={form.slug}
                  onChange={handleChange}
                  placeholder="Ej: nuevos"
                  required
                />
                <small className={styles.hint}>Solo letras minúsculas, números y guiones.</small>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Ícono</label>
                <div className={styles.iconSelector}>
                  <div
                    className={styles.iconPreview}
                    onClick={() => setIconPickerOpen((v) => !v)}
                  >
                    <ion-icon name={form.icono} />
                    <span>{form.icono}</span>
                    <ion-icon name="chevron-down-outline" />
                  </div>
                  <input name="icono" type="hidden" value={form.icono} />
                  {iconPickerOpen && (
                    <div className={styles.iconGrid}>
                      {ICONOS_SUGERIDOS.map((ic) => (
                        <button
                          key={ic}
                          type="button"
                          className={`${styles.iconOpt} ${form.icono === ic ? styles.iconOptActive : ""}`}
                          onClick={() => {
                            setForm((p) => ({ ...p, icono: ic }));
                            setIconPickerOpen(false);
                          }}
                          title={ic}
                        >
                          <ion-icon name={ic} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Orden</label>
                  <input
                    name="orden"
                    type="number"
                    min="0"
                    className={styles.input}
                    value={form.orden}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Estado</label>
                  <select name="activa" className={styles.select} value={form.activa} onChange={handleChange}>
                    <option value="1">Activa</option>
                    <option value="0">Inactiva</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className={styles.alertError}>
                  <ion-icon name="alert-circle-outline" />
                  {error}
                </div>
              )}
              {exito && (
                <div className={styles.alertExito}>
                  <ion-icon name="checkmark-circle-outline" />
                  {exito}
                </div>
              )}

              <div className={styles.modalBtns}>
                <button type="button" className={styles.btnCancelar} onClick={cerrarModal} disabled={guardando}>
                  Cancelar
                </button>
                <button type="submit" className={styles.btnGuardar} disabled={guardando}>
                  {guardando ? (
                    <><ion-icon name="hourglass-outline" /> Guardando...</>
                  ) : (
                    <><ion-icon name="save-outline" /> {editandoId ? "Guardar cambios" : "Crear categoría"}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}