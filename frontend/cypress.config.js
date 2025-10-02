// frontend/cypress.config.js
const { defineConfig } = require("cypress");
const { execSync } = require("node:child_process");
const path = require("node:path");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    video: false,
    setupNodeEvents(on, config) {
      on("task", {
        // Ejecuta el seed del backend antes de cada spec
        "db:seed"() {
          // Si corres Cypress desde frontend/, sube un nivel a backend/
          const backendPath = path.join(__dirname, "..", "backend");
          execSync("python manage.py seed_testdata", {
            cwd: backendPath,
            stdio: "inherit",
          });
          return null;
        },
      });
    },
  },
});
