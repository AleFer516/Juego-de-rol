import React, { useEffect, useState } from "react";
import { almacenamientoToken } from "../api";

// A11y: detectar la ruta actual para marcar el link activo
const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
const isActive = (href) => currentPath === href;


export default function Header() {
  const [rol, setRol] = useState(localStorage.getItem("rol") || "");
  const [open, setOpen] = useState(false);

  // Paleta
  const c = {
    50: "#EBF9F7",
    100: "#C8EFE9",
    200: "#A4E5DB",
    300: "#81DACD",
    400: "#5DD0BF",
    500: "#36BBA7",
    600: "#2FA291",
    700: "#257E71",
    800: "#1A5B51",
    900: "#103731",
    950: "#061412",
  };

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "rol") setRol(e.newValue || "");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function logout() {
    almacenamientoToken.limpiar();
    window.location.href = "/login";
  }

  const LinkItem = ({ href, children }) => (
    <a
      href={href}
      aria-current={isActive(href) ? "page" : undefined}
      className={`rounded-xl px-3 py-2 text-sm font-medium text-[${c[800]}] hover:bg-[${c[50]}] focus:outline-none focus-visible:ring-2 focus-visible:ring-[${c[300]}]`}
    >
      {children}
    </a>
  );

  return (
    <header className={`sticky top-0 z-20 w-full bg-white/80 backdrop-blur`}>
      {/* barra superior finita como acento */}
      <div
        className={`h-1 w-full bg-gradient-to-r from-[${c[500]}] via-[${c[600]}] to-[${c[700]}]`}
      />
      <div className={`mx-auto max-w-5xl px-4`}>
        <div
          className={`flex h-16 items-center justify-between border-b border-[${c[100]}]`}
        >
          {/* Brand minimal (sin texto ni logo): una “pastilla” decorativa */}
          <a href="/personajes" className="flex items-center gap-3" aria-label="Ir a Personajes">
            <span
              className={`h-8 w-8 rounded-2xl ring-1 ring-inset ring-[${c[200]}]`}
              style={{
                background:
                  `linear-gradient(135deg, ${c[300]} 0%, ${c[600]} 100%)`,
                boxShadow:
                  "0 2px 10px rgba(37,126,113,0.18), inset 0 1px 0 rgba(255,255,255,0.5)",
              }}
            />
            <span className={`hidden sm:inline text-sm font-semibold text-[${c[900]}]`}>
              Panel
            </span>
          </a>

          {/* A11y: landmark de navegación con nombre accesible */}
          <nav className="hidden gap-1 md:flex" role="navigation" aria-label="Navegación principal">
            <LinkItem href="/personajes">Personajes</LinkItem>
            {rol === "GM" && <LinkItem href="/catalogo">Catálogo (GM)</LinkItem>}
          </nav>

          {/* Right */}
          <div className="hidden items-center gap-2 md:flex">
            <span className={`text-xs text-[${c[700]}]`}>
              {rol ? `Rol: ${rol}` : " "}
            </span>
            <button
              onClick={logout}
              className={`rounded-xl bg-[${c[700]}] px-3 py-2 text-sm font-semibold text-white hover:bg-[${c[800]}] focus:outline-none focus-visible:ring-2 focus-visible:ring-[${c[400]}]`}
            >
              Salir
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className={`md:hidden rounded-xl p-2 text-[${c[800]}] hover:bg-[${c[50]}] focus:outline-none focus-visible:ring-2 focus-visible:ring-[${c[300]}]`}
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menú"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-3">
            {/* A11y: navegación móvil etiquetada */}
            <nav className="flex flex-col gap-1" role="navigation" aria-label="Navegación móvil">
              <a
                href="/personajes"
                className={`rounded-xl px-3 py-2 text-sm font-medium text-[${c[800]}] hover:bg-[${c[50]}] focus:outline-none focus-visible:ring-2 focus-visible:ring-[${c[300]}]`}
              >
                Personajes
              </a>
              {rol === "GM" && (
                <a
                  href="/catalogo"
                  className={`rounded-xl px-3 py-2 text-sm font-medium text-[${c[800]}] hover:bg-[${c[50]}] focus:outline-none focus-visible:ring-2 focus-visible:ring-[${c[300]}]`}
                >
                  Catálogo (GM)
                </a>
              )}
              <div className="mt-2 flex items-center justify-between rounded-xl border px-3 py-2"
                   style={{ borderColor: c[100], backgroundColor: c[50] }}>
                <span className={`text-xs font-medium text-[${c[700]}]`}>
                  {rol ? `Rol: ${rol}` : "Sesión"}
                </span>
                <button
                  onClick={logout}
                  className={`rounded-lg bg-[${c[700]}] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[${c[800]}] focus:outline-none focus-visible:ring-2 focus-visible:ring-[${c[400]}]`}
                >
                  Salir
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
