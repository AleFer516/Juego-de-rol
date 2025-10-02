import React, { useState } from "react";
import { login, obtenerYo, almacenamientoToken } from "../api";
import { Link } from "react-router-dom";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const BG_URL = "/fondo_login.png";

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!usuario.trim() || !clave) {
      setError("Completa usuario y contraseña.");
      return;
    }
    try {
      setCargando(true);
      await login({ usuario, clave });
      await obtenerYo();
      window.location.href = "/personajes";
  } catch (err) {
    let msg = err?.response?.data?.detail || "Credenciales inválidas.";
    if (msg.includes("locked out") || msg.includes("demasiados intentos")) {
      msg = "Has superado el número de intentos. Intenta más tarde.";
    }
    setError(msg);
    almacenamientoToken.limpiar();
  } finally {
    setCargando(false);
  }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${BG_URL})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="fixed inset-0 z-10 bg-[#061412]/70" />

      <div className="fixed inset-0 z-20 flex items-center justify-center px-4">
          {/* A11y: landmark del contenido principal */}
          <main id="contenido-principal" className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="mt-3 text-2xl font-bold text-[#EBF9F7]">Inicia sesión</h1>
            <p className="mt-1 text-sm text-[#C8EFE9]">
              Usa tu usuario y contraseña para ingresar.
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-[#2FA291]/30 bg-[#EBF9F7]/80 backdrop-blur-md p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
          >
            <label className="block mb-4">
              <span className="mb-1 block text-sm font-medium text-[#103731]">Usuario</span>
              <input
                className="w-full rounded-xl border border-[#A4E5DB] bg-white/90 px-3 py-2 text-sm text-[#103731]"
                placeholder="tu usuario"
                autoComplete="username"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
              />
            </label>

            <label className="block mb-2">
              <span className="mb-1 block text-sm font-medium text-[#103731]">Contraseña</span>
              <input
                className="w-full rounded-xl border border-[#A4E5DB] bg-white/90 px-3 py-2 text-sm text-[#103731]"
                placeholder="••••••••"
                type="password"
                autoComplete="current-password"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
              />
            </label>

            {error && (
              // A11y: anunciar errores con role="alert" y aria-live
              <div
                role="alert"
                aria-live="assertive"
                className="mt-2 rounded-xl bg-[#5DD0BF]/15 px-3 py-2 text-sm text-[#257E71] ring-1 ring-[#5DD0BF]/40"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="mt-4 w-full rounded-xl bg-[#36BBA7] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2FA291] disabled:opacity-60"
            >
              {cargando ? "Entrando..." : "Entrar"}
            </button>

            <p className="mt-4 text-center text-xs text-[#58746f]">
              ¿No tienes cuenta?{" "}
              <Link to="/register" className="font-semibold text-[#103731] hover:underline">
                Regístrate
              </Link>
            </p>
          </form>

          <p className="mt-6 text-center text-xs text-[#A4E5DB]">
            © {new Date().getFullYear()} Juego
          </p>
        </main>
      </div>
    </>
  );
}
