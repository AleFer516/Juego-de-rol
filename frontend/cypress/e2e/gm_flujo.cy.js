describe("Flujo GM", () => {
  before(() => {
    cy.task("db:seed");
  });

  it("GM administra catálogo y personajes", () => {
    cy.visit("/login");
    cy.loginAs("gm");

    // Ir al catálogo (visible solo para GM)
    cy.visit("/catalogo");
    cy.contains("Catálogo (solo GM)").should("be.visible");

    // Crear raza “Orco”
    cy.contains("Razas").parent().within(() => {
      cy.get('input[placeholder="Nueva raza"]').type("Orco");
      cy.contains("Agregar").click();
    });

    // Ir a personajes
    cy.visit("/personajes");
    cy.contains("Perfil GM").should("be.visible");

    // Crear personaje rápido
    cy.contains("Editor (GM)").should("be.visible");
    cy.get('input[placeholder="Nombre"]').clear().type("Thrall");
    cy.get('select').eq(0).select("Humano");      // Raza (del seed)
    cy.get('select').eq(1).select("Fuego");       // Poder
    cy.get('select').eq(2).select("Espada");      // Equipamiento
    cy.contains("Crear personaje").click();

    // Debe verse en la lista
    cy.contains("Thrall").should("be.visible");

    // Setear opciones de habilidades (seleccionamos las 3)
    cy.contains("Thrall").parents("li").within(() => {
      cy.get("select").contains("(opción 1)").parent().select("Sigilo");
      cy.get("select").contains("(opción 2)").parent().select("Fuerza");
      cy.get("select").contains("(opción 3)").parent().select("Sabiduría");
      cy.contains("Guardar opciones").click();
      cy.contains("actuales:").should("contain.text", "Sigilo");
    });

    // Subir nivel y cambiar estado
    cy.contains("Thrall").parents("li").within(() => {
      cy.contains("Subir nivel").click();
      cy.contains("Nivel 2").should("be.visible");

      cy.contains("CONGELADO").click();
      cy.contains("CONGELADO").should("be.visible");

      cy.contains("VIVO").click();
      cy.contains("VIVO").should("be.visible");
    });

    // Liberar (volver al pool)
    cy.contains("Thrall").parents("li").within(() => {
      cy.contains("Liberar").click();
    });
  });
});
