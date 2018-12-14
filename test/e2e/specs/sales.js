describe('Test the sales Page', ()=>{
    it('should visit the sales Page', ()=>{
        cy.accessSidebar('/sales')
    })
    it('should update start and end date to be a new range', ()=>{
        cy.typeIn('input[aria-label="Select Start Date"]', "2018-10-10")
        cy.typeIn('input[aria-label="Select End Date"]', "2018-12-13")        
    })
})