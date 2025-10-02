import { http, HttpResponse } from "msw";

const API = "http://127.0.0.1:8000/api";

export const handlers = [
  // --- Auth ---
  http.post(`${API}/token/`, async ({ request }) => {
    const body = await request.json();
    if (body.username === "gm" && body.password === "Passw0rd!") {
      return HttpResponse.json({ access: "fake.jwt.token" }, { status: 200 });
    }
    if (body.username === "user" && body.password === "Passw0rd!") {
      return HttpResponse.json({ access: "fake.jwt.token" }, { status: 200 });
    }
    return HttpResponse.json({ detail: "Credenciales inválidas." }, { status: 401 });
  }),

  http.get(`${API}/yo/`, () => {
    // Por defecto rol GM para tests que lo requieran (puedes cambiarlo en tests con server.use)
    return HttpResponse.json({ id: 1, usuario: "gm", rol: "GM" }, { status: 200 });
  }),

  // --- Catálogo (GM) ---
  http.get(`${API}/razas/`, () => HttpResponse.json([{ id: 1, nombre: "Humano" }])),
  http.get(`${API}/habilidades/`, () => HttpResponse.json([{ id: 1, nombre: "Sigilo" }, { id: 2, nombre: "Fuerza" }])),
  http.get(`${API}/poderes/`, () => HttpResponse.json([{ id: 1, nombre: "Fuego" }])),
  http.get(`${API}/equipamientos/`, () => HttpResponse.json([{ id: 1, nombre: "Espada" }])),

  http.post(`${API}/razas/`, async ({ request }) => {
    const body = await request.json();
    if (!body?.nombre) return HttpResponse.json({ detail: "Nombre requerido" }, { status: 400 });
    return HttpResponse.json({ id: 2, nombre: body.nombre }, { status: 201 });
  }),

  // --- Personajes ---
  http.get(`${API}/personajes/`, () =>
    HttpResponse.json([
      {
        id: 10,
        nombre: "Arthas",
        nivel: 1,
        estado: "VIVO",
        raza_nombre: "Humano",
        poder_nombre: "Fuego",
        equipamiento_nombre: "Espada",
        propietario_username: "gm",
        opciones: [{ id: 1, nombre: "Sigilo" }, { id: 2, nombre: "Fuerza" }],
        seleccion: [],
      },
    ])
  ),

  http.get(`${API}/personajes/disponibles/`, () =>
    HttpResponse.json([
      {
        id: 99,
        nombre: "SinDueño",
        nivel: 1,
        estado: "VIVO",
        raza_nombre: "Humano",
        poder_nombre: "Fuego",
        equipamiento_nombre: "Espada",
        propietario_username: null,
        opciones: [{ id: 1, nombre: "Sigilo" }, { id: 2, nombre: "Fuerza" }],
        seleccion: [],
      },
    ])
  ),

  http.post(`${API}/personajes/99/elegir/`, () =>
    HttpResponse.json({ ok: true, personaje: 99, propietario: "user" }, { status: 200 })
  ),
];
