// src/tests/api.unit.test.js
import { describe, it, expect, beforeEach, vi } from "vitest";

/* ========= Mocks hoisted (antes del vi.mock) ========= */
const hoisted = vi.hoisted(() => {
  return {
    mockPost: vi.fn(),
    mockGet: vi.fn(),
    interceptorUse: vi.fn(),
  };
});

/* ========= Mock de axios ========= */
vi.mock("axios", () => {
  const instance = {
    get: (...a) => hoisted.mockGet(...a),
    post: (...a) => hoisted.mockPost(...a),
    interceptors: { request: { use: hoisted.interceptorUse } },
    defaults: { headers: {} },
  };
  const create = vi.fn(() => instance);
  const axiosDefaultPost = (...a) => hoisted.mockPost(...a);
  return { default: { create, post: axiosDefaultPost } };
});

/* ========= Importar después del mock ========= */
import {
  almacenamientoToken,
  login,
  obtenerYo,
  Catalogo,
  PersonajesAPI,
} from "../api";

describe("api.js unitario", () => {
  const { mockGet, mockPost, interceptorUse } = hoisted;

  beforeEach(() => {
    localStorage.clear();
    mockGet.mockReset();
    mockPost.mockReset();
    interceptorUse.mockReset();
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

  it("interceptor agrega Authorization cuando hay token", () => {
    // función registrada por api.js al importar el módulo
    const call = interceptorUse.mock.calls[0];
    expect(call).toBeTruthy();
    const interceptorFn = call[0];

    almacenamientoToken.guardar("xyz");
    const cfg = interceptorFn({ headers: {} });
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

    await PersonajesAPI.listar();
    await PersonajesAPI.disponibles();
    expect(mockGet).toHaveBeenCalledWith("/personajes/");
    expect(mockGet).toHaveBeenCalledWith("/personajes/disponibles/");

    await PersonajesAPI.elegir(7);
    expect(mockPost).toHaveBeenCalledWith("/personajes/7/elegir/");

    await PersonajesAPI.elegirHabilidades(7, { habilidades: [1, 2] });
    expect(mockPost).toHaveBeenCalledWith("/personajes/7/elegir-habilidades/", { habilidades: [1, 2] });

    await PersonajesAPI.setOpciones(7, { opcion_hab1: 1 });
    expect(mockPost).toHaveBeenCalledWith("/personajes/7/set-opciones/", { opcion_hab1: 1 });

    await PersonajesAPI.subirNivel(7);
    expect(mockPost).toHaveBeenCalledWith("/personajes/7/subir_nivel/");

    await PersonajesAPI.cambiarEstado(7, "VIVO");
    expect(mockPost).toHaveBeenCalledWith("/personajes/7/cambiar_estado/", { estado: "VIVO" });

    await PersonajesAPI.liberar(7);
    expect(mockPost).toHaveBeenCalledWith("/personajes/7/liberar/");

    await PersonajesAPI.crear({ nombre: "Thrall" });
    expect(mockPost).toHaveBeenCalledWith("/personajes/", { nombre: "Thrall" });
  });
});
