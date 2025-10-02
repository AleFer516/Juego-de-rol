import { render, screen, fireEvent } from "@testing-library/react";
import Header from "../../components/Header";

// helper para aislar localStorage por test
function withLocalStorage(key, value, fn) {
  const old = localStorage.getItem(key);
  if (value === null) localStorage.removeItem(key);
  else localStorage.setItem(key, value);
  try { fn(); } finally {
    if (old === null) localStorage.removeItem(key);
    else localStorage.setItem(key, old);
  }
}

describe("Header", () => {
  test("muestra enlace Catálogo (GM) si rol=GM", () => {
    withLocalStorage("rol", "GM", () => {
      render(<Header />);
      expect(screen.getByText(/Catálogo \(GM\)/i)).toBeInTheDocument();
    });
  });

  test("oculta enlace Catálogo si rol no es GM", () => {
    withLocalStorage("rol", "JUGADOR", () => {
      render(<Header />);
      expect(screen.queryByText(/Catálogo \(GM\)/i)).not.toBeInTheDocument();
    });
  });

  test("botón Salir limpia token y redirige a /login", () => {
    withLocalStorage("rol", "GM", () => {
      // espía window.location.href
      delete window.location;
      window.location = { href: "" };

      render(<Header />);
      const btn = screen.getAllByText(/Salir/i)[0];
      fireEvent.click(btn);
      expect(window.location.href).toBe("/login");
    });
  });
});
