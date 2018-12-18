describe('Test the team Page', ()=>{
    it('should visit the team Page', ()=>{
        // login
        cy.login(Cypress.env('validEmail'), Cypress.env('validPass'))
        cy.accessSidebar('/team')
    })
    let teams = []
    it(`should access team members team`, function(){
        //View children will check the current page, then each childs subsequen pages
        cy.viewChildren()
    })

    it('Should test for user name in Lineage', ()=>{
        const $name = Cypress.$('#MainCard .headline')
        cy.contains(`#Lineage`, $name.text())
        // cy.get(`#Lineage`).contains('a','Benjamin').click()
        cy.wait(1000)
    })

    /* it('should update the month date', function(){
        let date = new Date()
        cy.wait(2000)
        cy.get('#MainCard').contains('Date Joined').invoke('text').then((text)=>{
            console.log(text)
            let texts = text.split(" ")
            date = new Date(texts[2])
        
            if(date.getMonth() === 11){
                date.setMonth(0)
                date.setFullYear(date.getFullYear() +1)
            }
            else{
                date.setMonth(date.getMonth()+1)
            }
            console.log("Date1: ", date)
            cy.get('input[aria-label="Choose Month"]')
             .clear()
             .type(`${date.getFullYear()}-${date.getMonth()>9 ? date.getMonth() + 1: '0' + (date.getMonth() + 1)}`)
             .should('have.value', `${date.getFullYear()}-${date.getMonth()>9 ? date.getMonth() + 1: '0' + (date.getMonth() + 1)}`)
        
            cy.contains('OK').click()

        })
        cy.get('#MainCard').contains('Date Joined').should('contain', 'NaN/NaN/NaN')

        // console.log("DATE: ",date.getFullYear(), date.getMonth())
        // cy.log("final total: "+ total)
    }) */
})