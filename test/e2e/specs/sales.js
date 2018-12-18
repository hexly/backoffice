describe('Test the sales Page', ()=>{
    it('should Login', ()=>{
        cy.login(Cypress.env('validEmail'), Cypress.env('validPass'))
    })
    it('should visit the sales Page', ()=>{
        cy.accessSidebar('/sales')
    })
    it('should update start and end date to be a new range', ()=>{
        cy.contains("No data available")
        cy.typeIn('input[aria-label="Select Start Date"]', "2018-01-01")
        cy.typeIn('input[aria-label="Select End Date"]', "2018-12-31")
        cy.get(".v-datatable>tbody>tr:first > td:nth-child(3)").contains("$")
        cy.get(".v-datatable>tbody>tr:first > td:nth-child(4)").contains("27")
        cy.get(".v-datatable>tbody>tr:first > td:nth-child(5)").contains("46")
        cy.get(".v-datatable>tbody>tr:first > td:nth-child(6)").contains("47")
        cy.get(".v-datatable>tbody>tr:first > td:nth-child(7)").contains("Fred")
        cy.get(".v-datatable>tbody>tr:first > td:nth-child(8)").contains(Cypress.env("validEmail"))

        cy.selectSort(4, 'ascending')
    })
})