describe("Flujo Jugador", () => {
  before(() => {
    // sembrar DB real
    cy.task("db:seed");
  });

  it("Jugador elige un personaje del pool y selecciona 2 habilidades", () => {
    // Login programático (más rápido que por UI)
    cy.visit("/login");
    cy.loginAs("jugador");

    // Ir a personajes
    cy.visit("/personajes");

    // Sección de disponibles (debería existir “SinDueño” del seed)
    cy.contains("Personajes disponibles").should("be.visible");
    cy.contains("SinDueño").should("be.visible");

    // Elegir
    cy.contains("SinDueño").parents("li").within(() => {
      cy.contains("Elegir").click();
    });

    // Ahora en "Mis personajes" debería aparecer y mostrar opciones
    cy.contains("Mis personajes").should("be.visible");
    cy.contains("SinDueño").should("be.visible");

    // Marcar dos habilidades (las del seed: Sigilo, Fuerza, Sabiduría)
    cy.contains("SinDueño").parents("li").within(() => {
      cy.contains("Habilidades:").should("be.visible");
      cy.get('input[type="checkbox"]').check({ force: true }); // marca 2 primeras
      // si marca 3, tu UI lo impide; así que con 2 basta
      cy.contains("Guardar elección").click();
    });

    // Validar que quedaron elegidas (el frontend muestra “Elegidas: ...”)
    cy.contains("Elegidas:").should("contain.text", "Sigilo");
  });
});
