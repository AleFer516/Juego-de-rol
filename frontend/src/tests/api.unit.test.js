// src/tests/api.unit.test.js
import { describe, it, expect, beforeEach, vi } from "vitest";

/* ===== Hoisted mocks ===== */
const hoisted = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockPatch: vi.fn(),
  mockDelete: vi.fn(),
  savedInterceptor: null, // guardaremos aquí la función del interceptor
}));

/* ===== Mock de axios ===== */
vi.mock("axios", () => {
  const inst = {
    get: (...a) => hoisted.mockGet(...a),
    post: (...a) => hoisted.mockPost(...a),
    patch: (...a) => hoisted.mockPatch(...a),
    delete: (...a) => hoisted.mockDelete(...a),
    interceptors: {
      request: {
        // guardamos la fn en una variable accesible por el test
        use: (fn) => { hoisted.savedInterceptor = fn; },
      },
    },
    defaults: { headers: {} },
  };
  const create = vi.fn(() => inst);
  const axiosDefaultPost = (...a) => hoisted.mockPost(...a);
  return { default: { create, post: axiosDefaultPost } };
});

/* ===== Importar después del mock ===== */
import {
  almacenamientoToken,
  login,
  obtenerYo,
  Catalogo,
  PersonajesAPI,
} from "../api";

describe("api.js unitario", () => {
  const { mockGet, mockPost, mockPatch, mockDelete } = hoisted;

  beforeEach(() => {
    localStorage.clear();
    mockGet.mockReset();
    mockPost.mockReset();
    mockPatch.mockReset();
    mockDelete.mockReset();
    hoisted.savedInterceptor = null;
  });

  it("almacenamientoToken guarda/lee/limpia", () => {
    expect(almacenamientoToken.leer()).toBeNull();
    almacenamientoToken.guardar("abc");
    expect(almacenamientoToken.leer()).toBe("abc");
    almacenamientoToken.limpiar();
    expect(almacenamientoToken.leer()).toBeNull();
    expect(localStorage.getItem("rol")).toBeNull();
  });

  it("login guarda access token", async () => {
    mockPost.mockResolvedValueOnce({ data: { access: "token.jwt" } });
    const res = await login({ usuario: "gm", clave: "Passw0rd!" });
    expect(res.access).toBe("token.jwt");
    expect(localStorage.getItem("token")).toBe("token.jwt");
    expect(mockPost).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/token\/$/),
      { username: "gm", password: "Passw0rd!" },
      expect.any(Object)
    );
  });

test("interceptor agrega Authorization cuando hay token", () => {
  // En el mock dejamos guardado lo que se pasó a cliente.interceptors.request.use(...)
  // Con Axios v1 esa llamada puede recibir:
  //  - una función (onFulfilled)
  //  - o un objeto { onFulfilled, onRejected }
  // Por eso soportamos ambas.
  const interceptor = hoisted.savedInterceptor;

  // Debe existir algo guardado
  expect(interceptor).toBeTruthy();

  // Normalizamos a una función ejecutable
  const runInterceptor =
    typeof interceptor === "function"
      ? interceptor
      : interceptor && typeof interceptor.onFulfilled === "function"
      ? interceptor.onFulfilled
      : null;

  expect(
    typeof runInterceptor === "function",
    "interceptor debe ser función o tener onFulfilled"
  ).toBe(true);

  // Simulamos que ya hay token guardado
  almacenamientoToken.guardar("xyz");

  // Ejecutamos el interceptor y validamos el header
  const cfg = runInterceptor({ headers: {} });
  expect(cfg.headers.Authorization).toBe("Bearer xyz");
});

  it("obtenerYo guarda rol en localStorage", async () => {
    mockGet.mockResolvedValueOnce({ data: { id: 1, usuario: "gm", rol: "GM" } });
    const yo = await obtenerYo();
    expect(yo.rol).toBe("GM");
    expect(localStorage.getItem("rol")).toBe("GM");
    expect(mockGet).toHaveBeenCalledWith("/yo/");
  });

  it("Catalogo.* llama endpoints correctos", async () => {
    mockGet.mockResolvedValue({ data: [] });
    mockPost.mockResolvedValue({ data: { id: 9, nombre: "Orco" } });

    await Catalogo.listarRazas();
    await Catalogo.listarHabilidades();
    await Catalogo.listarPoderes();
    await Catalogo.listarEquipamientos();
    expect(mockGet).toHaveBeenCalledWith("/razas/");
    expect(mockGet).toHaveBeenCalledWith("/habilidades/");
    expect(mockGet).toHaveBeenCalledWith("/poderes/");
    expect(mockGet).toHaveBeenCalledWith("/equipamientos/");

    await Catalogo.crearRaza("Orco");
    await Catalogo.crearHabilidad("Sigilo");
    await Catalogo.crearPoder("Fuego");
    await Catalogo.crearEquipamiento("Espada");
    expect(mockPost).toHaveBeenCalledWith("/razas/", { nombre: "Orco" });
    expect(mockPost).toHaveBeenCalledWith("/habilidades/", { nombre: "Sigilo" });
    expect(mockPost).toHaveBeenCalledWith("/poderes/", { nombre: "Fuego" });
    expect(mockPost).toHaveBeenCalledWith("/equipamientos/", { nombre: "Espada" });
  });

  it("PersonajesAPI: listar, disponibles y acciones", async () => {
    mockGet.mockResolvedValue({ data: [] });
    mockPost.mockResolvedValue({ data: { ok: true } });
    mockPatch.mockResolvedValue({ data: { ok: true } });
    mockDelete.mockResolvedValue({ data: {} });

    await PersonajesAPI.listar();
    await PersonajesAPI.disponibles();
    expect(mockGet).toHaveBeenCalledWith("/personajes/");
    expect(mockGet).toHaveBeenCalledWith("/personajes/disponibles/");

    await PersonajesAPI.elegir(7);
    expect(mockPost).toHaveBeenCalledWith("/personajes/7/elegir/");

    await PersonajesAPI.elegirHabilidades(7, { habilidades: [1, 2] });
    expect(mockPost).toHaveBeenCalledWith("/personajes/7/elegir-habilidades/", { habilidades: [1, 2] });

    await PersonajesAPI.setOpciones(7, { opcion_hab1: 1 });
    expect(mockPatch).toHaveBeenCalledWith("/personajes/7/set-opciones/", { opcion_hab1: 1 });

    await PersonajesAPI.subirNivel(7);
    expect(mockPost).toHaveBeenCalledWith("/personajes/7/subir_nivel/");

    await PersonajesAPI.cambiarEstado(7, "VIVO");
    expect(mockPost).toHaveBeenCalledWith("/personajes/7/cambiar_estado/", { estado: "VIVO" });

    await PersonajesAPI.liberar(7);
    expect(mockPost).toHaveBeenCalledWith("/personajes/7/liberar/");

    await PersonajesAPI.crear({ nombre: "Thrall" });
    expect(mockPost).toHaveBeenCalledWith("/personajes/", { nombre: "Thrall" });

    await PersonajesAPI.actualizar(7, { nombre: "T" });
    expect(mockPatch).toHaveBeenCalledWith("/personajes/7/", { nombre: "T" });

    await PersonajesAPI.eliminar(7);
    expect(mockDelete).toHaveBeenCalledWith("/personajes/7/");
  });
});
