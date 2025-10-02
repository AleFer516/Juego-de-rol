import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../../pages/Login";
import { server } from "../../mocks/server";
import { http, HttpResponse } from "msw";

function renderWithRouter(ui) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe("Login", () => {
  beforeEach(() => {
    // limpiar storage por test
    localStorage.clear();
    // evitar navegación real
    delete window.location;
    window.location = { href: "" };
  });

  test("muestra errores si faltan campos", async () => {
    renderWithRouter(<Login />);
    fireEvent.click(screen.getByRole("button", { name: /Entrar/i }));
    expect(await screen.findByText(/Completa usuario y contraseña/i)).toBeInTheDocument();
  });

  test("login exitoso redirige a /personajes", async () => {
    renderWithRouter(<Login />);

    fireEvent.change(screen.getByPlaceholderText(/tu usuario/i), { target: { value: "gm" } });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "Passw0rd!" } });
    fireEvent.click(screen.getByRole("button", { name: /Entrar/i }));

    await waitFor(() => {
      expect(window.location.href).toBe("/personajes");
      // token guardado
      expect(localStorage.getItem("token")).toBeTruthy();
      // rol guardado (por /yo/)
      expect(localStorage.getItem("rol")).toBe("GM");
    });
  });

  test("login con credenciales inválidas muestra mensaje", async () => {
    // Forzamos respuesta 401 para este test
    server.use(
      http.post("http://127.0.0.1:8000/api/token/", () =>
        HttpResponse.json({ detail: "Credenciales inválidas." }, { status: 401 })
      )
    );

    renderWithRouter(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/tu usuario/i), { target: { value: "x" } });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "y" } });
    fireEvent.click(screen.getByRole("button", { name: /Entrar/i }));

    expect(await screen.findByText(/Credenciales inválidas./i)).toBeInTheDocument();
  });
});
