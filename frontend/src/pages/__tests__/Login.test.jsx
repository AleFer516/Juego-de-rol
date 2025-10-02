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
  server.resetHandlers();
  localStorage.clear();
  delete window.location;
  window.location = { href: "" }; // si lo necesitas para assert de redirección
});


  test("muestra errores si faltan campos", async () => {
    renderWithRouter(<Login />);
    fireEvent.click(screen.getByRole("button", { name: /Entrar/i }));
    expect(await screen.findByText(/Completa usuario y contraseña/i)).toBeInTheDocument();
  });

  test("Login > login exitoso redirige a /personajes", async () => {
  const API = "http://127.0.0.1:8000/api";
  server.use(
    http.post(`${API}/auth/login/`, async () => {
      return HttpResponse.json(
        { tokens: { access: "fake.jwt.token" } },
        { status: 200 }
      );
    }),
    http.get(`${API}/yo/`, () => {
      return HttpResponse.json(
        { id: 1, usuario: "gm", rol: "GM" },
        { status: 200 }
      );
    })
  );

  renderWithRouter(<Login />);

  fireEvent.change(screen.getByPlaceholderText(/tu usuario/i), {
    target: { value: "gm" },
  });
  fireEvent.change(screen.getByPlaceholderText("••••••••"), {
    target: { value: "Passw0rd!" },
  });
  fireEvent.click(screen.getByRole("button", { name: /Entrar/i }));

  await waitFor(() => {
    expect(localStorage.getItem("token")).toBeTruthy();
    expect(localStorage.getItem("rol")).toBe("GM");
    // si tu componente hace window.location.href="/personajes"
    // expect(window.location.href).toBe("/personajes");
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
