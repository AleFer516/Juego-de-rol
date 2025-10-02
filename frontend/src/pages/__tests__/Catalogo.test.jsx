import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Catalogo from "../../pages/Catalogo";

beforeEach(() => {
  localStorage.setItem("rol", "GM");
  localStorage.setItem("token", "fake.jwt.token");
});

function renderWithRouter(ui) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

test("permite crear nueva raza (mock API)", async () => {
  renderWithRouter(<Catalogo />);
  // espera a que cargue listas
  expect(await screen.findByText(/Razas/i)).toBeInTheDocument();

  const input = screen.getByPlaceholderText(/Nueva raza/i);
  fireEvent.change(input, { target: { value: "Orco" } });
  fireEvent.click(screen.getByRole("button", { name: /Agregar/i }));

  // no verificamos lista actualizada porque el MSW devuelve nuevo ítem con otra llamada;
  // este smoke test valida que el flujo no falla.
  await waitFor(() => expect(input.value).toBe("")); // se limpió el campo tras agregar
});
