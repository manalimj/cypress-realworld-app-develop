Feature: User Authentication

**As a** user of the application  
**I want to** be able to sign up, log in, and log out  
**So that** I can securely access and use the application

#### Scenario: User Sign Up, Login, and Logout Successfully
**Given** the user is on the sign-up page  
**When** the user enters valid sign-up details  
**And** clicks the "Sign Up" button  
**Then** the user should be redirected to the login page  
**And** see a confirmation message "Sign up successful. Please log in."

**Given** the user is on the login page  
**When** the user enters valid login credentials  
**And** clicks the "Log In" button  
**Then** the user should be redirected to the dashboard  
**And** see a welcome message "Welcome, [Username]"

**Given** the user is logged in and on the dashboard  
**When** the user clicks the "Log Out" button  
**Then** the user should be logged out  
**And** be redirected to the home page  
**And** see a message "You have been logged out successfully."

---

#### Scenario: Display Appropriate Error Messages for Invalid Login Attempts
**Given** the user is on the login page  
**When** the user enters an invalid username  
**And** clicks the "Log In" button  
**Then** the user should see an error message "Invalid username or password."

**Given** the user is on the login page  
**When** the user enters an invalid password  
**And** clicks the "Log In" button  
**Then** the user should see an error message "Invalid username or password."

**Given** the user is on the login page  
**When** the user leaves the username field blank  
**And** clicks the "Log In" button  
**Then** the user should see an error message "Username is required."

**Given** the user is on the login page  
**When** the user leaves the password field blank  
**And** clicks the "Log In" button  
**Then** the user should see an error message "Password is required."