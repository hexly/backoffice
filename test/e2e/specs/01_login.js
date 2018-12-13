
describe('Testing Login Page', () => {
    it('Visits the login page', () => {
      cy.visit('')
  
      cy.contains('div','Veridian Dynamics Login')
      cy.contains('button', 'Login')
      cy.get('input[name="email"]')
      cy.get('input[name="password"]')
      cy.contains('a', 'Register')
      cy.contains('a', 'Reset Password')
    })
    it('tests incorrect logins, and checks for correct response', ()=>{
      cy.login()
      cy.contains('Invalid Username/Password.')
    
      cy.login(Cypress.env("invalidEmail"))
      cy.contains('Invalid Username/Password.')
  
      cy.login(undefined, Cypress.env("invalidPass"))
      cy.contains('Invalid Username/Password.')
  
      cy.login(Cypress.env("invalidEmail"), Cypress.env("invalidPass"))
      cy.contains('Invalid Username/Password.')
    })
    it('tests the correct login, and should go to /dashboard', ()=>{
      cy.login(Cypress.env("validEmail"), Cypress.env("validPass"))
  
      cy.url().should('contain', '/dashboard')
    })
  })
  
  