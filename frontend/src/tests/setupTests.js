// src/setupTests.js
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "./mocks/server";

// Evita que falles por alguna ruta sin mock.
// Puedes cambiar a 'warn' si prefieres ver un aviso.
server.listen({ onUnhandledRequest: "bypass" });

beforeAll(() => {
  // Nada extra por ahora
});

afterEach(() => {
  server.resetHandlers();
  // Limpia timers/mock fetch si los usas
  vi.clearAllMocks?.();
  // Limpia localStorage entre tests por sanidad
  try {
    localStorage.clear();
  } catch {}
});

afterAll(() => {
  server.close();
});
