#### Feature: User Transactions

**As a** user of the application  
**I want to** initiate payments to other users  
**So that** I can transfer funds securely and efficiently

---

#### Scenario: User Initiates a Payment to Another User
**Given** the user is logged in and on the dashboard  
**And** the user has sufficient balance in their account  
**When** the user navigates to the "Payments" page  
**And** enters the recipient's username and the payment amount  
**And** clicks the "Send Payment" button  
**Then** the user should see a confirmation message "Payment initiated successfully."

---

#### Scenario: Payment Amount is Correctly Deducted from the Payer’s Balance and Added to the Recipient’s Balance
**Given** the user is logged in and on the dashboard  
**And** the user has sufficient balance in their account  
**And** the recipient is a valid user  
**When** the user initiates a payment of $100 to the recipient  
**Then** $100 should be deducted from the payer’s balance  
**And** $100 should be added to the recipient’s balance  
**And** both users should receive notifications of the transaction

---

#### Scenario: Payment History is Updated Correctly
**Given** the user is logged in and on the dashboard  
**And** the user has initiated a payment  
**When** the user navigates to the "Payment History" page  
**Then** the user should see the recent payment transaction in the list  
**And** the transaction details should include the recipient's username, amount, date, and status "Completed"