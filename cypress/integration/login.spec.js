describe('Login Test', () => {
  const mockUser = {
    userName: 'dave@7oaksgroup.com',
    password: 'Password1'
  }

  it('Simple Login & Logout', () => {
    cy.visit('http://localhost:8080/')
    cy.get('[data-cy=\'Username Login Page\']').type(mockUser.userName)
    cy.get('[data-cy=\'Password Login Page\']').type(mockUser.password)
    cy.get('[data-cy=\'Login Login Page\']').click()
    cy.get('[data-cy=\'Display Name\']').click()
    cy.wait(6000)
    cy.get('[data-cy=\'Logout\']').click()
  })
})
