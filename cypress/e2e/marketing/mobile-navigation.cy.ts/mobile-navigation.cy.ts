describe("mobile navigation trigger", () => {
  it("keeps a 40px tap target at narrow widths", () => {
    cy.viewport(320, 800);
    cy.visit("/contact-sales");

    cy.get('button[aria-label="Open navigation menu"]').should(($button) => {
      const bounds = $button[0].getBoundingClientRect();
      expect(bounds.width).to.eq(40);
      expect(bounds.height).to.eq(40);
    }).click();

    cy.get('nav[aria-label="Mobile navigation"]').should("be.visible");
  });
});
