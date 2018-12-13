describe('Testing the dashboard page', ()=>{
    it('should login', ()=>{
        cy.login(Cypress.env('validEmail'), Cypress.env('validPass'))
    })
    it('should find if there is a need to go to profile page', ()=>{
      cy.wait(2000)
        /* const $profilePrompt = Cypress.$('div[class="v-dialog v-dialog--active v-dialog--persistent"]')
        if($profilePrompt.length){
            console.log('it Exists', $profilePrompt)
        }
        console.log('a log', $profilePrompt) */
    
      cy.get('button').contains('Profile Page')
        .then(($btn)=>{
          $btn.click()

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
            cy.typeIn('div[class="flex xs6"]>div[data-v-ced23842] input[aria-label="Name"]', userInfo.address.Name)
            cy.typeIn('input[aria-label="Street"]', userInfo.address.Street)
            cy.typeIn('input[aria-label="City"]', userInfo.address.City)
            cy.typeIn('input[aria-label="State/Province"]', userInfo.address.State)
            cy.typeIn('input[aria-label="Postal Code"]', userInfo.address.PostalCode)
            cy.typeIn('input[aria-label="Country"]', userInfo.address.Country)

            cy.contains('button', 'Save Address').click()

            cy.accessSidebar('/dashboard')
            })
        })
    })
    it('should choose month on dashboard', ()=>{
        cy.typeIn('input[aria-label="Choose Month"]', "2018-10")
    })
  })