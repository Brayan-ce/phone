"use client";

import { useState, useRef } from "react";
import { loginAdmin } from "./servidor";
import styles from "./login.module.css";

export default function Login() {
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [verPass, setVerPass] = useState(false);
  const formRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    const formData = new FormData(formRef.current);
    const result = await loginAdmin(formData);
    if (result?.error) {
      setError(result.error);
      setCargando(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardTop}>
          <div className={styles.logoWrap}>
            <img src="/logo.png" alt="M Importaciones" className={styles.logo} />
          </div>
          <h1 className={styles.titulo}>Panel de administración</h1>
          <p className={styles.subtitulo}>Ingresá tus credenciales para continuar</p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="username">
              Usuario
            </label>
            <div className={styles.inputWrap}>
              <ion-icon name="person-outline" />
              <input
                id="username"
                name="username"
                type="text"
                className={styles.input}
                placeholder="Nombre de usuario"
                autoComplete="username"
                autoCapitalize="off"
                spellCheck={false}
                disabled={cargando}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Contraseña
            </label>
            <div className={styles.inputWrap}>
              <ion-icon name="lock-closed-outline" />
              <input
                id="password"
                name="password"
                type={verPass ? "text" : "password"}
                className={styles.input}
                placeholder="Contraseña"
                autoComplete="current-password"
                disabled={cargando}
              />
              <button
                type="button"
                className={styles.togglePass}
                onClick={() => setVerPass((v) => !v)}
                aria-label={verPass ? "Ocultar contraseña" : "Ver contraseña"}
                tabIndex={-1}
              >
                <ion-icon name={verPass ? "eye-off-outline" : "eye-outline"} />
              </button>
            </div>
          </div>

          {error && (
            <div className={styles.errorMsg}>
              <ion-icon name="alert-circle-outline" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className={styles.btnSubmit}
            disabled={cargando}
          >
            {cargando ? (
              <>
                <ion-icon name="hourglass-outline" />
                Ingresando...
              </>
            ) : (
              <>
                <ion-icon name="log-in-outline" />
                Ingresar
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}