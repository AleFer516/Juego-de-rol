import React, { useState } from "react";
import { registrarse, obtenerYo } from "../api";
import { Link } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const BG_URL = "/fondo_login.png";

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password || !password2) {
      setError("Completa usuario y contraseñas.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== password2) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setCargando(true);
      await registrarse({ username, email, password, password2 });
      await obtenerYo();
      window.location.href = "/personajes";
    } catch (err) {
      const d = err?.response?.data || {};
      const msg = d.detail || d.username?.[0] || d.email?.[0] || d.password2?.[0] || "No se pudo registrar.";
      setError(msg);
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
        {/* A11y: landmark para contenido principal */}
        <main id="contenido-principal" className="w-full max-w-md">
          <div className="mb-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-[#36BBA7]/15 ring-1 ring-[#36BBA7]/30 flex items-center justify-center" />
            <h1 className="mt-3 text-2xl font-bold text-[#EBF9F7]">Crear cuenta</h1>
            <p className="mt-1 text-sm text-[#C8EFE9]">Regístrate para comenzar a jugar.</p>
          </div>

          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-[#2FA291]/30 bg-[#EBF9F7]/80 backdrop-blur-md p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
          >
            <label className="block mb-4">
              <span className="mb-1 block text-sm font-medium text-[#103731]">Usuario</span>
              <input
                className="w-full rounded-xl border border-[#A4E5DB] bg-white/90 px-3 py-2 text-sm text-[#103731]"
                placeholder="nombre de usuario"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>

            <label className="block mb-4">
              <span className="mb-1 block text-sm font-medium text-[#103731]">Email (opcional)</span>
              <input
                className="w-full rounded-xl border border-[#A4E5DB] bg-white/90 px-3 py-2 text-sm text-[#103731]"
                placeholder="tucorreo@ejemplo.com"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="block mb-4">
              <span className="mb-1 block text-sm font-medium text-[#103731]">Contraseña</span>
              <input
                className="w-full rounded-xl border border-[#A4E5DB] bg-white/90 px-3 py-2 text-sm text-[#103731]"
                placeholder="••••••••"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <label className="block mb-2">
              <span className="mb-1 block text-sm font-medium text-[#103731]">Repite contraseña</span>
              <input
                className="w-full rounded-xl border border-[#A4E5DB] bg-white/90 px-3 py-2 text-sm text-[#103731]"
                placeholder="••••••••"
                type="password"
                autoComplete="new-password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
              />
            </label>

            {error && (
            // A11y: errores anunciados por lectores de pantalla
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
              {cargando ? "Creando..." : "Crear cuenta"}
            </button>

            <p className="mt-4 text-center text-xs text-[#1A5B51]">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="font-semibold text-[#257E71] hover:underline">
                Inicia sesión
              </Link>
            </p>
          </form>

          <p className="mt-6 text-center text-xs text-[#A4E5DB]">
            © {new Date().getFullYear()} Juego RPG
          </p>
        </main>
      </div>
    </>
  );
}
