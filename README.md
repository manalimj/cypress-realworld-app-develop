Part 1: Environment setup
Set up the Cypress real world application
1.Clone the Cypress Real World App repository, from:
https://github.com/manalimj/cypress-realworld-app-develop
2.a.npm install
b.npm start
Note: There may be some anomalies for you locally on your own device. Specific versions may be required for node and yarn, etc.
Note: There is a pre-built DB seed command in the code that may be used for setting up test data. cy.task("db:seed");
Note: Cypress supports both Javascript and Typescript. Feel free to utilise either of these (Fund Recs currently uses Javascript)
Set up Cypress
1.Install Cypress if it is not already installed
2.Open Cypress test runner using command: npx cypress open

Part 2: Writing Tests
This repository contains automated tests for the Cypress Real World App, designed to ensure the application functions correctly across various scenarios. The tests are organized in the `cypress/tests` folder.
1. User Authentication Test
- **Sign Up, Log In, and Log Out:**
  
- **Invalid Login Attempts:**
  - Ensure that appropriate error messages are displayed when invalid login credentials are used.

 2. Transaction Test
- **Initiate Payment:**
  - Verify that a user can initiate a payment to another user.

- **Balance Update:**
  - Ensure the payment amount is correctly deducted from the payer’s balance and added to the recipient’s balance.

- **Payment History:**
  - Verify that the payment history is updated correctly after transactions.

3. Notification Test
- **Display Notifications:**
  - Verify that notifications are displayed for different events such as successful payment and received payment.

- **Dismiss Notifications:**
  - Ensure that notifications can be dismissed and do not reappear once dismissed.

4. UI Validation Test
- **UI Elements Presence:**
  - Verify the presence and correct rendering of key UI elements (e.g., buttons, input fields, navigation menus) on the dashboard page.

Part 3: Advanced Testing
This repository contains advanced testing scenarios for the Cypress Real World App, including mocking and stubbing API responses and creating custom Cypress commands.
 1. Mocking and Stubbing
 Objective
Write a test that uses `cy.intercept()` to mock an API response for a transaction and verify that the application handles the mocked response correctly.
 Implementation
1. **Mock API Response:**
   - Use `cy.intercept()` to intercept the network request for initiating a transaction and provide a mocked response.
   
2. **Verify Application Behavior:**
   - Verify that the application correctly handles the mocked API response, updating the UI and transaction history as expected.

#### Example Test
```javascript
describe('Mocking and Stubbing', () => {
  it('should handle a mocked API response for a transaction', () => {
    // Intercept the transaction API call and provide a mock response
    cy.intercept('POST', '/api/transactions', {
      statusCode: 200,
      body: {
        id: 'mock-transaction-id',
        amount: 100,
        payerId: 'user1',
        payeeId: 'user2',
        status: 'success',
      },
    }).as('mockTransaction');

    // Perform the action that triggers the API call
    cy.visit('/transactions');
    cy.get('#initiate-transaction-button').click();
    cy.get('#amount-input').type('100');
    cy.get('#payee-select').select('user2');
    cy.get('#submit-transaction-button').click();

    // Wait for the intercepted API call
    cy.wait('@mockTransaction');

    // Verify the UI updates
    cy.get('#transaction-history').should('contain', 'mock-transaction-id');
    cy.get('#transaction-history').should('contain', '100');
  });
});
```

2. Custom Commands
Create a custom Cypress command for a repetitive task (e.g., logging in, navigating to a specific page, etc.) and demonstrate its usage in one of your tests.
   
.Use Custom Command:**
   - Use the custom command in your test to perform the repetitive task.

Example Custom Command
```javascript
// cypress/support/commands.js
Cypress.Commands.add('login', (username, password) => {
  cy.visit('/login');
  cy.get('#username').type(username);
  cy.get('#password').type(password);
  cy.get('#login-button').click();
});
```

#### Example Test Using Custom Command
```javascript
describe('Custom Commands', () => {
  it('should log in and navigate to the dashboard', () => {
    // Use the custom login command
    cy.login('testuser', 'password123');

    // Verify successful login by checking for dashboard elements
    cy.url().should('include', '/dashboard');
    cy.get('#welcome-message').should('contain', 'Welcome, testuser');
  });
});
```

 Project Setup Instructions

1. **Install Dependencies:**
   - Ensure you have Node.js and npm installed on your system.
   - Run `npm install` in the project directory to install Cypress and other dependencies.

2. **Adding Tests:**
   - Place your test files in the `cypress/tests` folder.

3. **Running Tests:**
   - Open Cypress Test Runner: `npx cypress open`
   - Run all tests: `npx cypress run`

Custom Commands
- **Objective:** Simplify repetitive tasks in tests.
- **Custom Command:** `Cypress.Commands.add('login', (username, password) => {...});`
- **Example Test:** See the example provided in the "Custom Commands" section.

 Assumptions and Limitations
- Assumes the backend API is functioning correctly.
- Tests are designed based on the current UI and may need updates if the UI changes.

By following the steps and examples provided, you can implement advanced testing scenarios in your Cypress Real World App, enhancing the robustness and reliability of your test suite.

