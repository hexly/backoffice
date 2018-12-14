describe('Testing the navbar', ()=>{
    it('test that 3 members of the navbar exist',()=>{
        cy.login(Cypress.env('validEmail'),Cypress.env('validPass'))
        cy.wait(1500)
        cy.contains('nav','Backoffice')
        cy.get('nav>div>button')
        cy.get('nav .v-toolbar__items')
    })
    it('Test that the sidebar has everything', ()=>{
        cy.get('.v-toolbar__side-icon')
            .click()

        cy.get('aside')
        cy.contains('a', 'Dashboard')
        cy.contains('a', 'Profile')
        cy.contains('a', 'Sales')
        cy.contains('a', 'Team')
    })
})