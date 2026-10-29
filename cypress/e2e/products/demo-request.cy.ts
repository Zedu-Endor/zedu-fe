export {};

const productPages = ["channels", "file-management"];

for (const width of [1280, 375]) {
  describe(`product demo requests at ${width}px`, () => {
    for (const product of productPages) {
      it(`takes ${product} prospects to the sales form`, () => {
        cy.viewport(width, 800);
        cy.visit(`/products/${product}`);

        cy.contains("a", "Request a demo")
          .should("be.visible")
          .and("have.attr", "href", "/contact-sales")
          .within(() => {
            cy.get("button").should("not.exist");
          });
        cy.contains("a", "Request a demo").focus().should("have.focus");
        cy.screenshot(`1183-${product}-${width}`, { capture: "viewport" });
        cy.contains("a", "Request a demo").click();

        cy.location("pathname").should("equal", "/contact-sales");
        cy.get("#name").should("be.visible");
        cy.get("#email").should("be.visible");
        cy.get("#message").should("be.visible");
      });
    }
  });
}
