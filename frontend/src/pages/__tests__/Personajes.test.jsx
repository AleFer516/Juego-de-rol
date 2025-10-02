import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Personajes from "../../pages/Personajes";

// set rol por defecto
beforeEach(() => {
  localStorage.setItem("rol", "GM"); // para ver lista completa
  localStorage.setItem("token", "fake.jwt.token");
});

function renderWithRouter(ui) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

test("muestra personajes desde la API y controles GM", async () => {
  renderWithRouter(<Personajes />);

  // Encabezado
  expect(await screen.findByText(/Personajes/i)).toBeInTheDocument();
  // Ítem de ejemplo servido por MSW
  expect(await screen.findByText("Arthas")).toBeInTheDocument();
  // Botones de GM visibles
  expect(screen.getByRole("button", { name: /Editar/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Subir nivel/i })).toBeInTheDocument();
});

test("si no es GM, muestra 'Personajes disponibles' y botón Elegir", async () => {
  localStorage.setItem("rol", "JUGADOR");
  renderWithRouter(<Personajes />);

  expect(await screen.findByText(/Personajes disponibles/i)).toBeInTheDocument();
  expect(await screen.findByRole("button", { name: /Elegir/i })).toBeInTheDocument();
});
