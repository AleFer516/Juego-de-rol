// src/pages/__tests__/Register.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { server } from "../../mocks/server";
import { http, HttpResponse } from "msw";
import Register from "../Register";

function renderWithRouter(ui) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe("Register.jsx", () => {
  beforeEach(() => {
    localStorage.clear();
    delete window.location;
    window.location = { href: "" };
  });

  test("muestra errores de validación local (campos vacíos y mismatch)", async () => {
    renderWithRouter(<Register />);
    fireEvent.click(screen.getByRole("button", { name: /Crear cuenta/i }));
    expect(await screen.findByText(/Completa usuario y contraseñas/i)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/nombre de usuario/i), { target: { value: "user" } });
    fireEvent.change(screen.getAllByPlaceholderText("••••••••")[0], { target: { value: "abc123" } });
    fireEvent.change(screen.getAllByPlaceholderText("••••••••")[1], { target: { value: "zzz999" } });
    fireEvent.click(screen.getByRole("button", { name: /Crear cuenta/i }));
    expect(await screen.findByText(/no coinciden/i)).toBeInTheDocument();
  });

  test("registro exitoso redirige a /personajes y guarda token si viene", async () => {
    // Mock del endpoint de registro (autenticación + autologin)
    server.use(
      http.post("http://127.0.0.1:8000/api/auth/register/", async () => {
        return HttpResponse.json(
          { user: { id: 1, username: "user", rol: "JUGADOR" }, tokens: { access: "fake.access" } },
          { status: 201 }
        );
      }),
      http.get("http://127.0.0.1:8000/api/yo/", () =>
        HttpResponse.json({ id: 1, usuario: "user", rol: "JUGADOR" })
      )
    );

    renderWithRouter(<Register />);
    fireEvent.change(screen.getByPlaceholderText(/nombre de usuario/i), { target: { value: "user" } });
    fireEvent.change(screen.getByPlaceholderText(/tucorreo@ejemplo.com/i), { target: { value: "u@x.com" } });
    fireEvent.change(screen.getAllByPlaceholderText("••••••••")[0], { target: { value: "Passw0rd!" } });
    fireEvent.change(screen.getAllByPlaceholderText("••••••••")[1], { target: { value: "Passw0rd!" } });
    fireEvent.click(screen.getByRole("button", { name: /Crear cuenta/i }));

    await waitFor(() => {
      expect(window.location.href).toBe("/personajes");
      expect(localStorage.getItem("token")).toBeTruthy();
      expect(localStorage.getItem("rol")).toBe("JUGADOR");
    });
  });

  test("error del backend se muestra (ej: usuario ya existe)", async () => {
    server.use(
      http.post("http://127.0.0.1:8000/api/auth/register/", () =>
        HttpResponse.json({ username: ["Ese usuario ya existe."] }, { status: 400 })
      )
    );
    renderWithRouter(<Register />);

    fireEvent.change(screen.getByPlaceholderText(/nombre de usuario/i), { target: { value: "repetido" } });
    fireEvent.change(screen.getAllByPlaceholderText("••••••••")[0], { target: { value: "Passw0rd!" } });
    fireEvent.change(screen.getAllByPlaceholderText("••••••••")[1], { target: { value: "Passw0rd!" } });
    fireEvent.click(screen.getByRole("button", { name: /Crear cuenta/i }));

    expect(await screen.findByText(/Ese usuario ya existe\./i)).toBeInTheDocument();
  });
});
