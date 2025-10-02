// src/tests/setupTests.js
import "@testing-library/jest-dom";

// MSW (servidor de mocks para pruebas de integración)
import { server } from "../mocks/server";

// Arranca/parar MSW para pruebas (solo test)
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
