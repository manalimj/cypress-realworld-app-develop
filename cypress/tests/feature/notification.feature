### Notification Test in BDD Format

#### Feature: Notifications

**As a** user of the application  
**I want to** receive notifications for different events  
**So that** I can stay informed about important actions and updates

---

#### Scenario: Notifications are Displayed for Different Events
**Given** the user is logged in and on the dashboard  
**When** the user initiates a payment  
**Then** a notification should be displayed with the message "Payment successful."

**Given** the user is logged in and on the dashboard  
**When** the user receives a payment  
**Then** a notification should be displayed with the message "You have received a payment."

---

#### Scenario: Notifications Can Be Dismissed and Do Not Reappear
**Given** the user is logged in and has an unread notification  
**When** the user clicks the "Dismiss" button on the notification  
**Then** the notification should disappear from the dashboard  
**And** the notification should not reappear after the user navigates away from and returns to the dashboard

---