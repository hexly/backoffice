describe('Test the team Page', ()=>{
    let refs = []
    it('should visit the team Page', ()=>{
        // 
        cy.login(Cypress.env('validEmail'), Cypress.env('validPass'))
        cy.accessSidebar('/team')
    })
    let teams = []
    it(`should access team members team`, function(){
        // console.log(done)
        /* return Promise.all(promises)
            .then(done) */
        cy.get('#TeamMembers').children().each((child, i, Arr)=>{
            console.log(child)
            console.log(Arr)
            cy.get(`#TeamMembers > div:nth-child(${i+1})`).contains('button','View Team')

            cy.get(`#TeamMembers > div:nth-child(${i+1})`).contains('Team Size').invoke('text').then((text)=>{
                teams.push(text)
            })//as(`t.teams[${i}]`)
            
            
        })
    })
    it('should count the team sizes', function (){
        cy.log(teams)
        let teamNum = teams.reduce((total, team)=>{
            return total = total + parseInt(team.split(" ")[2])
        }, 0)
        cy.log(teamNum)
        let num = []
        context('stuff', ()=>{
            it('should update Number, im hoping I can nest', ()=>{
                setTimeout(()=>{
                    num.push(1)
                },1000)
            })
        })
        num.push(2)
        cy.wait(3000)
        cy.log(num)
        /* cy.log(this)
        cy.log(this.t0)
        cy.log(this.t1)
        total = parseInt(this.t0.split(" ")[2]) + parseInt(this.t1.split(" ")[2]) + parseInt(this.t2.split(" ")[2]) */
    })

    it('should update the month date', function(){
        /* cy.log(this.t0.split(" ")[2])
        cy.log( this.t1.split(" ")[2])
        cy.log( this.t2.split(" ")[2]) */
        // cy.log(total)
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
            cy.log('inside Promise')
        })
        cy.log("outsidePromise")
        cy.get('#MainCard').contains('Date Joined').should('contain', 'NaN/NaN/NaN')

        // console.log("DATE: ",date.getFullYear(), date.getMonth())
        // cy.log("final total: "+ total)
    })
})