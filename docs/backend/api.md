# Backend API Documentation

## Overview

The FinT backend API is built with NestJS and provides RESTful endpoints for financial tracking functionality. The API uses JWT for authentication and includes Swagger documentation for detailed exploration.

## Base URL
- Development: `http://localhost:5000/api` (or as configured)
- Production: `https://api.fint.com` (example)

## Authentication

All protected endpoints require a valid JWT token in the `Authorization` header:

`Authorization: Bearer <jwt_token>`

---

## Endpoints

### Authentication

Controller: `auth.controller.ts`

#### `POST /auth/login`
Authenticates a user and returns a JWT token.

- **Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response:** JWT token and user information.

#### `POST /auth/register`
Registers a new user.

- **Request Body:**
```json
{
    "name": "John Doe",
  "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:** The newly created user object.

#### `GET /auth/me`
Retrieves the profile of the currently authenticated user.

- **Authentication:** Required
- **Response:** The user's profile information.

---

### Users

Controller: `users.controller.ts`

#### `GET /users`
Retrieves a list of all users.

- **Authentication:** Required (Admin)
- **Response:** An array of user objects.

#### `POST /users`
Creates a new user.

- **Authentication:** Required (Admin)
- **Request Body:** User creation data (name, email, password, etc.).
- **Response:** The newly created user object.

#### `GET /users/me`
Retrieves the profile of the currently authenticated user.

- **Authentication:** Required
- **Response:** The current user's profile.

#### `GET /users/:id`
Retrieves a specific user by their ID.

- **Authentication:** Required (Admin)
- **Response:** A single user object.

#### `PATCH /users/me`
Updates the profile of the currently authenticated user.

- **Authentication:** Required
- **Request Body:** Fields to update.
- **Response:** The updated user object.

#### `PATCH /users/:id`
Updates a specific user by their ID.

- **Authentication:** Required (Admin)
- **Request Body:** Fields to update.
- **Response:** The updated user object.

#### `DELETE /users/:id`
Deletes a user by their ID.

- **Authentication:** Required (Admin)
- **Response:** Confirmation message.

---

### Businesses

Controller: `business.controller.ts`

#### `GET /businesses`
Retrieves all businesses.

- **Authentication:** Required (Admin)
- **Response:** An array of business objects.

#### `POST /businesses`
Creates a new business.

- **Authentication:** Required (Admin, BusinessOwner)
- **Request Body:** Business creation data.
- **Response:** The newly created business object.

#### `GET /businesses/my`
Retrieves businesses for the current user.

- **Authentication:** Required
- **Response:** An array of business objects.

#### `GET /businesses/:id`
Retrieves a business by ID.

- **Authentication:** Required (Admin, BusinessOwner)
- **Response:** A single business object.

#### `PATCH /businesses/:id`
Updates a business by ID.

- **Authentication:** Required (Admin, BusinessOwner)
- **Request Body:** Fields to update.
- **Response:** The updated business object.

#### `DELETE /businesses/:id`
Deletes a business by ID.

- **Authentication:** Required (Admin)
- **Response:** Confirmation message.

---

### Accounts

Controller: `accounts.controller.ts`

#### `GET /accounts`
Retriereves all accounts.

- **Authentication:** Required (Admin, Accountant, Viewer)
- **Response:** An array of account objects.

#### `POST /accounts`
Creates a new account.

- **Authentication:** Required (Admin, Accountant)
- **Request Body:** `CreateAccountDto`
- **Response:** The newly created account object.

#### `GET /accounts/trial-balance`
Retrieves the trial balance.

- **Authentication:** Required (Admin, Accountant, Viewer)
- **Response:** The trial balance report.

#### `GET /accounts/:id`
Retrieves an account by ID.

- **Authentication:** Required (Admin, Accountant, Viewer)
- **Response:** A single account object.

#### `PATCH /accounts/:id`
Updates an account by ID.

- **Authentication:** Required (Admin, Accountant)
- **Request Body:** `UpdateAccountDto`
- **Response:** The updated account object.

#### `DELETE /accounts/:id`
Deletes an account by ID.

- **Authentication:** Required (Admin)
- **Response:** Confirmation message.

---

### Reports

Controller: `reports.controller.ts`

#### `GET /reports`
Generates and retrieves a report.

- **Authentication:** Required
- **Response:** A report object. 