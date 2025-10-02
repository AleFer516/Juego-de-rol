// frontend/cypress/support/commands.js
Cypress.Commands.add("loginAs", (username, password = "Passw0rd!") => {
  // 1) Obtenemos token desde backend real
  cy.request("POST", "http://127.0.0.1:8000/api/token/", {
    username,
    password,
  }).then((r) => {
    const access = r.body.access;
    expect(access, "JWT access").to.be.a("string");
    // guardamos token
    window.localStorage.setItem("token", access);

    // 2) Consultamos /yo/ para guardar el rol en storage
    cy.request({
      url: "http://127.0.0.1:8000/api/yo/",
      method: "GET",
      headers: { Authorization: `Bearer ${access}` },
    }).then((yo) => {
      window.localStorage.setItem("rol", yo.body.rol || "");
    });
  });
});
