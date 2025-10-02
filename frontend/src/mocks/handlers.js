// src/mocks/handlers.js
import { http, HttpResponse, delay } from "msw";

/**
 * ¡IMPORTANTE!
 * Usamos rutas con wildcard ("...") para que coincidan
 * sin importar el origen/baseURL que use tu cliente (axios/fetch).
 *
 * También devolvemos siempre JSON con las claves que espera tu UI:
 * - login/register: { access, ... }
 * - me: { rol }
 * - listas básicas para personajes y catálogo
  */

export const handlers = [
  // ---- AUTH ----
  http.post("*/auth/login/", async () => {
    // Simula un pequeño delay de red (opcional)
    await delay(10);
    return HttpResponse.json(
      {
        access: "token_login_123",
        refresh: "refresh_abc",
        user: { id: 1, username: "gm" },
      },
      { status: 200 }
    );
  }),

  http.post("*/auth/register/", async () => {
    await delay(10);
    return HttpResponse.json(
      {
        access: "token_reg_123",
        user: { id: 2, username: "user" },
      },
      { status: 201 }
    );
  }),

  http.get("*/auth/me/", async ({ request }) => {
    await delay(10);
    const auth = request.headers.get("Authorization") || "";
    // Si el token contiene "login" => GM, si no => JUGADOR
    const rol = auth.includes("token_login_") ? "GM" : "JUGADOR";
    return HttpResponse.json({ rol }, { status: 200 });
  }),

  // ---- PERSONAJES ----
  http.get("*/personajes/", async () => {
    await delay(10);
    return HttpResponse.json(
      [
        { id: 1, nombre: "Arthas", nivel: 10, raza: "Humano" },
        { id: 2, nombre: "Jaina", nivel: 8, raza: "Humano" },
      ],
      { status: 200 }
    );
  }),

  // Lista “disponibles” cuando el usuario NO es GM
  http.get("*/personajes/disponibles/", async () => {
    await delay(10);
    return HttpResponse.json(
      [
        { id: 3, nombre: "Thrall", nivel: 5, raza: "Orco" },
        { id: 4, nombre: "Valeera", nivel: 7, raza: "Elfa" },
      ],
      { status: 200 }
    );
  }),

  // Cualquier acción PATCH sobre personajes (edición, subir nivel, etc.)
  http.patch("*/personajes/:id", async () => {
    await delay(10);
    return HttpResponse.json({ ok: true }, { status: 200 });
  }),

  // ---- CATÁLOGO ----
  http.get("*/catalogo/razas/", async () => {
    await delay(10);
    return HttpResponse.json(["Humano"], { status: 200 });
  }),

  http.post("*/catalogo/razas/", async () => {
    await delay(10);
    return HttpResponse.json({ ok: true }, { status: 201 });
  }),

  // (Opcional) Si tu UI hiciera otras llamadas “genéricas”,
  // puedes agregar más handlers wildcard aquí.
];
