describe('Testing the dashboard page', ()=>{
    it('should find if there is a need to go to profile page', ()=>{
      cy.wait(2000)
            .then(()=>{
                const $profilePrompt = Cypress.$('div.v-dialog.v-dialog--active.v-dialog--persistent')
                if($profilePrompt.length){
                    cy.contains('button', 'Profile Page').click()
                    cy.url().should('contain', '/profile')

                    context('Mandatory Profile Update', ()=>{
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
                      cy.accessSidebar('/dashboard')
                    })
                }
                console.log('a log', $profilePrompt)
            })
    }) 
    it('should choose month on dashboard', ()=>{
        //I would love to use typeIn, but I need to click ok to actually update the page
        // cy.typeIn('input[aria-label="Choose Month"]', "2018-10")
        cy.get('input[aria-label="Choose Month"]')
            .clear()
            .type('2018-10')
            .should('have.value', '2018-10')
        
        cy.contains('OK').click()
    })
  })