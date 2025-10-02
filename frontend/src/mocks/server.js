// src/mocks/server.js
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// Servidor MSW para pruebas en Node/Vitest
export const server = setupServer(...handlers);
