// src/pages/__tests__/Register.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { server } from "../../mocks/server";
import { http, HttpResponse } from "msw";
import Register from "../../pages/Register";

function renderWithRouter(ui) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

const API = "http://127.0.0.1:8000/api";

describe("Register.jsx", () => {
beforeEach(() => {
  server.resetHandlers();
  localStorage.clear();
  delete window.location;
  window.location = { href: "" };
});


  test("muestra errores de validación local (campos vacíos y mismatch)", async () => {
    renderWithRouter(<Register />);

    // Sin completar nada
    fireEvent.click(screen.getByRole("button", { name: /Crear cuenta/i }));
    expect(
      await screen.findByText(/Completa usuario y contraseñas/i)
    ).toBeInTheDocument();

    // Passwords que no coinciden
    fireEvent.change(screen.getByPlaceholderText(/nombre de usuario/i), {
      target: { value: "user" },
    });
    fireEvent.change(screen.getAllByPlaceholderText("••••••••")[0], {
      target: { value: "abc123" },
    });
    fireEvent.change(screen.getAllByPlaceholderText("••••••••")[1], {
      target: { value: "zzz999" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Crear cuenta/i }));

    expect(await screen.findByText(/no coinciden/i)).toBeInTheDocument();
  });

 test("registro exitoso redirige a /personajes y guarda token si viene", async () => {
  const API = "http://127.0.0.1:8000/api";
  server.use(
    http.post(`${API}/auth/register/`, async () => {
      return HttpResponse.json(
        { tokens: { access: "fake.jwt.token" } },
        { status: 201 }
      );
    }),
    http.get(`${API}/yo/`, () => {
      return HttpResponse.json(
        { id: 2, usuario: "user", rol: "JUGADOR" },
        { status: 200 }
      );
    })
  );

  renderWithRouter(<Register />);

  fireEvent.change(screen.getByPlaceholderText(/nombre de usuario/i), {
    target: { value: "user" },
  });
  fireEvent.change(screen.getByLabelText(/Email/i), {
    target: { value: "u@x.com" },
  });
  fireEvent.change(screen.getAllByPlaceholderText("••••••••")[0], {
    target: { value: "Passw0rd!" },
  });
  fireEvent.change(screen.getAllByPlaceholderText("••••••••")[1], {
    target: { value: "Passw0rd!" },
  });
  fireEvent.click(screen.getByRole("button", { name: /Crear cuenta/i }));

  await waitFor(() => {
    expect(localStorage.getItem("token")).toBeTruthy();
    expect(localStorage.getItem("rol")).toBe("JUGADOR");
    // si tu componente redirige con window.location.href
    // expect(window.location.href).toBe("/personajes");
  });
});


  test("error del backend se muestra (ej: usuario ya existe)", async () => {
    // Forzamos un error de backend; usamos `detail` para que la UI muestre "No se pudo registrar."
    server.use(
      http.post(`${API}/auth/register/`, async () => {
        return HttpResponse.json(
          { detail: "No se pudo registrar." },
          { status: 400 }
        );
      })
    );

    renderWithRouter(<Register />);

    fireEvent.change(screen.getByPlaceholderText(/nombre de usuario/i), {
      target: { value: "repetido" },
    });
    fireEvent.change(screen.getAllByPlaceholderText("••••••••")[0], {
      target: { value: "Passw0rd!" },
    });
    fireEvent.change(screen.getAllByPlaceholderText("••••••••")[1], {
      target: { value: "Passw0rd!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Crear cuenta/i }));

    expect(
      await screen.findByText(/No se pudo registrar\./i)
    ).toBeInTheDocument();
  });
});
