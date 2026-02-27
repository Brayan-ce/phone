"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCategoriasList,
  getProductoById,
  crearProducto,
  editarProducto,
  eliminarImagenProducto,
} from "../servidor";
import styles from "../productos.module.css";

const IMAGE_BASE = process.env.NEXT_PUBLIC_UPLOADS_URL || "/uploads";

const BADGE_TIPOS = [
  { value: "nuevo",  label: "Nuevo" },
  { value: "pro",    label: "Pro" },
  { value: "usado",  label: "Usado" },
  { value: "oferta", label: "Oferta" },
];

export default function ProductoForm({ id }) {
  const router = useRouter();
  const formRef = useRef(null);
  const extraInputRef = useRef(null);

  const esEdicion = Boolean(id);

  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(esEdicion);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const [form, setForm] = useState({
    categoria_id: "",
    nombre: "",
    subtitulo: "",
    descripcion: "",
    storage: "",
    precio_usd: "",
    badge: "",
    badge_tipo: "nuevo",
    stock: "0",
    destacado: "0",
    activo: "1",
  });

  const [colores, setColores] = useState([]);
  const [nuevoColor, setNuevoColor] = useState({ nombre: "", hex_color: "#644c33" });
  const [imagenPrincipalPreview, setImagenPrincipalPreview] = useState(null);
  const [imagenesExistentes, setImagenesExistentes] = useState([]);
  const [imagenesNuevasPreview, setImagenesNuevasPreview] = useState([]);
  const [imagenesNuevasFiles, setImagenesNuevasFiles] = useState([]);

  useEffect(() => {
    async function cargar() {
      const cats = await getCategoriasList();
      setCategorias(cats);
      if (esEdicion) {
        const prod = await getProductoById(id);
        if (!prod) { router.push("/admin/productos"); return; }
        setForm({
          categoria_id: String(prod.categoria_id),
          nombre: prod.nombre || "",
          subtitulo: prod.subtitulo || "",
          descripcion: prod.descripcion || "",
          storage: prod.storage || "",
          precio_usd: prod.precio_usd || "",
          badge: prod.badge || "",
          badge_tipo: prod.badge_tipo || "nuevo",
          stock: String(prod.stock ?? 0),
          destacado: prod.destacado ? "1" : "0",
          activo: prod.activo ? "1" : "0",
        });
        setColores(prod.colores || []);
        setImagenesExistentes(prod.imagenes || []);
        if (prod.imagen_principal) {
          setImagenPrincipalPreview(`${IMAGE_BASE}/${prod.imagen_principal}`);
        }
        setCargando(false);
      }
    }
    cargar();
  }, [id]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? (checked ? "1" : "0") : value }));
  }

  function handleImagenPrincipal(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImagenPrincipalPreview(URL.createObjectURL(file));
  }

  function handleImagenesExtra(e) {
    const files = Array.from(e.target.files);
    setImagenesNuevasFiles((prev) => [...prev, ...files]);
    setImagenesNuevasPreview((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
    e.target.value = "";
  }

  function quitarImagenNueva(idx) {
    setImagenesNuevasFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagenesNuevasPreview((prev) => prev.filter((_, i) => i !== idx));
  }

  async function quitarImagenExistente(img) {
    await eliminarImagenProducto(img.id, img.nombre_archivo);
    setImagenesExistentes((prev) => prev.filter((i) => i.id !== img.id));
  }

  function agregarColor() {
    if (!nuevoColor.nombre.trim()) return;
    setColores((prev) => [...prev, { ...nuevoColor }]);
    setNuevoColor({ nombre: "", hex_color: "#644c33" });
  }

  function quitarColor(idx) {
    setColores((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setExito("");
    setGuardando(true);

    const fd = new FormData(formRef.current);
    fd.set("colores", JSON.stringify(colores));
    if (esEdicion) fd.set("id", id);

    imagenesNuevasFiles.forEach((f) => fd.append("imagenes_extra", f));

    const result = esEdicion ? await editarProducto(fd) : await crearProducto(fd);

    if (result?.error) {
      setError(result.error);
      setGuardando(false);
      return;
    }

    setExito(esEdicion ? "Producto actualizado correctamente." : "Producto creado correctamente.");
    setGuardando(false);
    setTimeout(() => router.push("/admin/productos"), 1200);
  }

  if (cargando) {
    return (
      <div className={styles.loadingState}>
        <ion-icon name="hourglass-outline" />
        <p>Cargando producto...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.titulo}>{esEdicion ? "Editar producto" : "Nuevo producto"}</h1>
          <p className={styles.subtitulo}>{esEdicion ? `ID #${id}` : "Completá los datos del nuevo producto"}</p>
        </div>
        <button className={styles.btnVolver} onClick={() => router.push("/admin/productos")}>
          <ion-icon name="arrow-back-outline" />
          Volver
        </button>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className={styles.formGrid}>

        <div className={styles.formCol}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <ion-icon name="information-circle-outline" />
              Información básica
            </h2>

            <div className={styles.field}>
              <label className={styles.label}>Categoría *</label>
              <select name="categoria_id" className={styles.select} value={form.categoria_id} onChange={handleChange} required>
                <option value="">Seleccioná una categoría</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Nombre *</label>
              <input name="nombre" className={styles.input} value={form.nombre} onChange={handleChange} placeholder="Ej: iPhone 16 Pro" required />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Subtítulo</label>
              <input name="subtitulo" className={styles.input} value={form.subtitulo} onChange={handleChange} placeholder="Ej: iPhone 16 Pro" />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Descripción</label>
              <textarea name="descripcion" className={styles.textarea} value={form.descripcion} onChange={handleChange} placeholder="Descripción del producto..." rows={4} />
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Storage</label>
                <input name="storage" className={styles.input} value={form.storage} onChange={handleChange} placeholder="Ej: 256 GB" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Precio USD *</label>
                <input name="precio_usd" type="number" step="0.01" min="0" className={styles.input} value={form.precio_usd} onChange={handleChange} placeholder="0.00" required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Stock</label>
                <input name="stock" type="number" min="0" className={styles.input} value={form.stock} onChange={handleChange} />
              </div>
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Badge</label>
                <input name="badge" className={styles.input} value={form.badge} onChange={handleChange} placeholder="Ej: Nuevo, Pro..." />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Tipo badge</label>
                <select name="badge_tipo" className={styles.select} value={form.badge_tipo} onChange={handleChange}>
                  {BADGE_TIPOS.map((b) => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.checkRow}>
              <label className={styles.checkLabel}>
                <input type="checkbox" name="destacado" value="1" checked={form.destacado === "1"} onChange={handleChange} className={styles.checkbox} />
                Destacado
              </label>
              {esEdicion && (
                <label className={styles.checkLabel}>
                  <input type="checkbox" name="activo" value="1" checked={form.activo === "1"} onChange={handleChange} className={styles.checkbox} />
                  Activo
                </label>
              )}
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <ion-icon name="color-palette-outline" />
              Colores disponibles
            </h2>
            <div className={styles.colorAddRow}>
              <input
                className={styles.input}
                placeholder="Nombre del color"
                value={nuevoColor.nombre}
                onChange={(e) => setNuevoColor((p) => ({ ...p, nombre: e.target.value }))}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); agregarColor(); } }}
              />
              <input
                type="color"
                className={styles.colorPicker}
                value={nuevoColor.hex_color}
                onChange={(e) => setNuevoColor((p) => ({ ...p, hex_color: e.target.value }))}
              />
              <button type="button" className={styles.btnAgregarColor} onClick={agregarColor}>
                <ion-icon name="add-outline" />
              </button>
            </div>
            {colores.length > 0 && (
              <div className={styles.coloresList}>
                {colores.map((c, i) => (
                  <div key={i} className={styles.colorChip}>
                    <span className={styles.colorDot} style={{ background: c.hex_color }} />
                    <span>{c.nombre}</span>
                    <span className={styles.colorHex}>{c.hex_color}</span>
                    <button type="button" className={styles.btnQuitarColor} onClick={() => quitarColor(i)}>
                      <ion-icon name="close-outline" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.formCol}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <ion-icon name="image-outline" />
              Imagen principal
            </h2>
            <div
              className={styles.dropzone}
              onClick={() => document.getElementById("input-principal").click()}
            >
              {imagenPrincipalPreview ? (
                <img src={imagenPrincipalPreview} alt="preview" className={styles.previewImg} />
              ) : (
                <div className={styles.dropzonePlaceholder}>
                  <ion-icon name="cloud-upload-outline" />
                  <span>Click para subir imagen</span>
                  <small>Se convierte a WebP automáticamente</small>
                </div>
              )}
            </div>
            <input
              id="input-principal"
              name="imagen_principal"
              type="file"
              accept="image/*"
              className={styles.inputFileHidden}
              onChange={handleImagenPrincipal}
            />
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <ion-icon name="images-outline" />
              Galería de imágenes
            </h2>

            <div className={styles.galeriaGrid}>
              {imagenesExistentes.filter((img) => !img.es_principal).map((img) => (
                <div key={img.id} className={styles.galeriaItem}>
                  <img src={`${IMAGE_BASE}/${img.nombre_archivo}`} alt={img.alt_texto || ""} />
                  <button
                    type="button"
                    className={styles.btnQuitarImg}
                    onClick={() => quitarImagenExistente(img)}
                    aria-label="Quitar imagen"
                  >
                    <ion-icon name="close-outline" />
                  </button>
                </div>
              ))}

              {imagenesNuevasPreview.map((src, i) => (
                <div key={`new-${i}`} className={`${styles.galeriaItem} ${styles.galeriaItemNueva}`}>
                  <img src={src} alt="" />
                  <button
                    type="button"
                    className={styles.btnQuitarImg}
                    onClick={() => quitarImagenNueva(i)}
                    aria-label="Quitar imagen"
                  >
                    <ion-icon name="close-outline" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                className={styles.galeriaAdd}
                onClick={() => extraInputRef.current?.click()}
              >
                <ion-icon name="add-outline" />
                <span>Agregar</span>
              </button>
            </div>

            <input
              ref={extraInputRef}
              type="file"
              accept="image/*"
              multiple
              className={styles.inputFileHidden}
              onChange={handleImagenesExtra}
            />
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

          <button type="submit" className={styles.btnGuardar} disabled={guardando}>
            {guardando ? (
              <><ion-icon name="hourglass-outline" /> Guardando...</>
            ) : (
              <><ion-icon name="save-outline" /> {esEdicion ? "Guardar cambios" : "Crear producto"}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}