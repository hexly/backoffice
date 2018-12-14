describe('Tests inputting information into profile page', ()=>{
    it('should visit the profile page', ()=>{
        cy.accessSidebar('/profile')
    })
    it('should update Your Information', ()=>{
        cy.wait(2000)//give the page a chance to load, sometimes the tests run to quick and the page refreshes after changes are made
        cy.typeIn('#ProfileName', 'Fred')
        

        cy.typeIn('input[aria-label="E-mail"]', Cypress.env('validEmail'))

        cy.typeIn('input[aria-label="Display name"]', 'Fred')

        cy.contains('button', 'Save Information')
            .click()
    })
    it('should update Your Address', ()=>{
        let userInfo = {
            address: {
            Name: 'MyName',
            Street: 'A Street',
            City: 'A City',
            State: 'A State',
            PostalCode: '00000',
            Country: 'A Country'
            }
        }
        cy.typeIn('#AddressName', userInfo.address.Name)
        cy.typeIn('input[aria-label="Street"]', userInfo.address.Street)
        cy.typeIn('input[aria-label="City"]', userInfo.address.City)
        cy.typeIn('input[aria-label="State/Province"]', userInfo.address.State)
        cy.typeIn('input[aria-label="Postal Code"]', userInfo.address.PostalCode)
        cy.typeIn('input[aria-label="Country"]', userInfo.address.Country)

        cy.contains('button', 'Save Address').click()
        cy.wait(1000)
    })
})