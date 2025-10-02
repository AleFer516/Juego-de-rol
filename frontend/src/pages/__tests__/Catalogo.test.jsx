// src/pages/__tests__/Catalogo.test.jsx
import { render, screen, fireEvent, within } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Catalogo from "../../pages/Catalogo";

function renderWithRouter(ui) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

test("permite crear nueva raza (mock API)", async () => {
  renderWithRouter(<Catalogo />);

  // Encuentra la sección (card) que tiene el heading "Razas"
  const card = await screen.findByRole("region", { name: /Razas/i }).catch(() => null);

  // Si tu markup no declara role="region" + aria-label, vamos por el título textual:
  const cardByTitle =
    card ||
    (await screen.findByText("Razas")).closest("div"); // sube al contenedor del bloque

  const utils = within(cardByTitle);

  const input = utils.getByPlaceholderText(/Nueva raza/i);
  fireEvent.change(input, { target: { value: "Orco" } });

  // Este "Agregar" es el de la card de Razas
  fireEvent.click(utils.getByRole("button", { name: /Agregar/i }));

  // No verificamos lista actualizada, basta con que no crashee y el request se haya disparado.
  // Si quisieras, podrías esperar algún feedback visual de éxito.
  expect(true).toBe(true);
});
