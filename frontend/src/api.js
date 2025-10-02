import axios from "axios";

// Usa VITE_API_URL, y si no existe, fallback a localhost (dev)
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const almacenamientoToken = {
  guardar(token) { localStorage.setItem("token", token); },
  leer() { return localStorage.getItem("token"); },
  limpiar() { localStorage.removeItem("token"); localStorage.removeItem("rol"); }
};

export const cliente = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

cliente.interceptors.request.use((config) => {
  const t = almacenamientoToken.leer();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export async function login({ usuario, clave }) {
  const payload = {
    username: String(usuario ?? "").trim(),
    password: String(clave ?? "")
  };
  const { data } = await axios.post(`${API_URL}/api/token/`, payload, {
    headers: { "Content-Type": "application/json" }
  });
  almacenamientoToken.guardar(data.access);
  return data;
}

export async function obtenerYo() {
  const { data } = await cliente.get("/yo/");
  localStorage.setItem("rol", data.rol || "");
  return data;
}

export const Catalogo = {
  listarRazas: () => cliente.get("/razas/").then(r=>r.data),
  crearRaza: (nombre) => cliente.post("/razas/", { nombre }).then(r=>r.data),

  listarHabilidades: () => cliente.get("/habilidades/").then(r=>r.data),
  crearHabilidad: (nombre) => cliente.post("/habilidades/", { nombre }).then(r=>r.data),

  listarPoderes: () => cliente.get("/poderes/").then(r=>r.data),
  crearPoder: (nombre) => cliente.post("/poderes/", { nombre }).then(r=>r.data),

  listarEquipamientos: () => cliente.get("/equipamientos/").then(r=>r.data),
  crearEquipamiento: (nombre) => cliente.post("/equipamientos/", { nombre }).then(r=>r.data),
};

export const PersonajesAPI = {
  listar: () => cliente.get("/personajes/").then(r=>r.data),
  disponibles: () => cliente.get("/personajes/disponibles/").then(r=>r.data),

  elegir: (id) => cliente.post(`/personajes/${id}/elegir/`).then(r=>r.data),
  elegirHabilidades: (id, payload) =>
    cliente.post(`/personajes/${id}/elegir-habilidades/`, payload).then(r=>r.data),

  setOpciones: (id, payload) =>
    cliente.patch(`/personajes/${id}/set-opciones/`, payload).then(r=>r.data),
  subirNivel: (id) => cliente.post(`/personajes/${id}/subir_nivel/`).then(r=>r.data),
  cambiarEstado: (id, estado) => cliente.post(`/personajes/${id}/cambiar_estado/`, { estado }).then(r=>r.data),
  liberar: (id) => cliente.post(`/personajes/${id}/liberar/`).then(r=>r.data),

  crear: (payload) => cliente.post("/personajes/", payload).then(r=>r.data),
  actualizar: (id, payload) => cliente.patch(`/personajes/${id}/`, payload).then(r=>r.data),
  eliminar: (id) => cliente.delete(`/personajes/${id}/`).then(r=>r.data),
};

// Registro (POST /api/auth/register/)
export async function registrarse({ username, email, password, password2 }) {
  const { data } = await cliente.post("/auth/register/", {
    username: String(username ?? "").trim(),
    email: String(email ?? "").trim(),
    password: String(password ?? ""),
    password2: String(password2 ?? "")
  });
  const access = data?.tokens?.access || data?.access || "";
  if (access) almacenamientoToken.guardar(access);
  return data;
}
