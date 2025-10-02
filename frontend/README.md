# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## CI/CD y Entornos
- **CI**: GitHub Actions ejecuta:
  - Backend: `check --deploy`, migraciones y `pytest`.
  - Frontend: `vitest` + `vite build`, y E2E con Cypress (opcional).
- **Entornos**:
  - Desarrollo: `.env.development` en frontend (`VITE_API_URL=http://127.0.0.1:8000`), `.env` en backend (no versionado).
  - Producción: Variables de entorno en el hosting (Django y Vite).
- **Seguridad**:
  - Secretos por variables (no en código), `DEBUG=False` en prod, CORS restringido al dominio del front, HTTPS en ambos lados.
