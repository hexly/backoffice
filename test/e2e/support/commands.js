// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

//Function: login
//Purpose: to login to backoffice
//Parameters: an email and password string formatted like "fake@gmail.com", "fakePass"
//Process: type in the email and password if they exist, then click login
Cypress.Commands.add('login', (email, pass)=>{
    //Visit, based on the base_url in cypress.json
    cy.visit('')

    //Type the email and password in if they exist
    if(email){
        cy.typeIn('input[name="email"]', `${email}`)
    }
    if(pass){
        cy.typeIn('input[name="password"]', `${pass}`)      
    }

    //Click login
    cy.contains('button', 'Login')
        .click()
})

//Function: typeIn
//Purpose: to make typing into a field easier
//Process: find the selector, focus it, clear it, then type and check that the value changed
Cypress.Commands.add('typeIn', (selector, text)=>{
    //Get the element to type into, do what you need to to type into it and check its value
    cy.get(`${selector}`)
        .focus()
        .clear()
        .type(`${text}`)
        .should('have.value', `${text}`)
})

//Function: accessSidebar
//Purpose: To access pages from the sidebar
//Parameters: takes in a page, formatted like "/dashboard"
//Process: open the sidebar, go to the page, and check to make sure that we went to the right page
Cypress.Commands.add('accessSidebar', (page)=>{
    //Open sidebar
    cy.get('.v-toolbar__side-icon').click()

    //click on the anchor element with the page link
    cy.get(`a[href="${page}"]`).click()

    //Makesure the url updated accordingly
    cy.url().should('contain', `${page}`)
})

//Function: selectSort
//Purpose: To select a sort column, and click it
//Parameters: column number, and sort style eg. ascending, descending, none
//Process: access the column, and click it.
Cypress.Commands.add('selectSort', (colmNum)=>{
    cy.get(`.v-datatable>thead>tr>th`).eq(colmNum).click()
})


//Function cy.viewChildren
//Purpose: To test the team page for all team members
//Parameters: The name of the lead to that team member, formatted like "Benjamin"
//Process: review current page, check for correct values, then call the function for all the children
Cypress.Commands.add('viewChildren', (parentName)=>{
    context('review the page', ()=>{
        //Finding the total team size of the children, and comparing it to the main cards team size
        cy.wait(1500).then(()=>{
            //wait to make sure that my jquery selectors have a loaded page to select from
            const $teamMembers = Cypress.$(`#TeamMembers`)

            //Base case of recursion, if there are no children, time to go up
            if($teamMembers[0].childElementCount){

                //Initialize variables for checking if team size and front line are correct
                let totalSize = 0
                let frontLine = 0

                //Go through each child, adding their team size to the total
                cy.get('#TeamMembers').children().each((child, i, Arr)=>{
                    //Access the team size from the child
                    const $childSize = Cypress.$(`#TeamMembers > div:nth-child(${i+1}) .team-size`)

                    //add the child's team size to the total
                    totalSize = totalSize + parseInt($childSize.text().split(" ")[2])

                    //Increase front line for each team member directly below them
                    frontLine += 1
                }).then(()=>{

                    //Use cypress Jquery to access the team size and front line from the main card
                    const $parentSize = Cypress.$(`#MainCard .team-size`)
                    const $parentFront = Cypress.$(`#MainCard .front-line`)

                    //check that the team size is equal to the main cards team size
                    expect(parseInt($parentSize.text().split(" ")[2])).to.equal(totalSize + 1)

                    //Check that the front line on main card is the same
                    expect(parseInt($parentFront.text().split(" ")[2])).to.equal(frontLine)
                })

                //Recursive case, for each child, tell them the name of their parent, then call this function for them
                cy.get('#TeamMembers').children().each((child, i, Arr)=>{
                    const $newParent = Cypress.$(`#MainCard .display-name`)
                    cy.log("Parent for next",$newParent.text())
                    cy.contains(`#TeamMembers > div:nth-child(${i+1}) button`, `View Team`).click()
                    cy.viewChildren($newParent.text())
                    
                    cy.wait(1000)
                    
                })
            }
            if(parentName){
                //If we are not the initial case, click on the link to go back one team member, identified by the parent we gave them
                cy.get(`#Lineage`).contains('a',parentName).click()
            }
            return
        })
    })
})
