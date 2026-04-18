# FitFinder API Documentation

## Overview

This document outlines all available endpoints in the FitFinder Express backend. Unless otherwise noted, all authenticated endpoints require an active session.

---

## Authentication Endpoints

### Sign Up
**POST** `/api/auth/signup`

- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string",
    "name": "string"
  }
  ```
- **Response:** User object with session
- **Notes:** Creates a new user account and establishes a session

### Sign In
**POST** `/api/auth/signin`

- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:** User object with session
- **Notes:** Authenticates user and creates session

### Logout
**POST** `/api/auth/logout`

- **Auth Required:** No
- **Response:** Success confirmation
- **Notes:** Destroys user session

### Get Current User
**GET** `/api/auth/me`

- **Auth Required:** Session check (returns 401 if no session)
- **Response:**
  ```json
  {
    "user": {...},
    "profile": {...}
  }
  ```
- **Notes:** Returns authenticated user and their profile

---

## Onboarding Endpoints

### Set User Role
**POST** `/api/onboarding/role`

- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "role": "CLIENT" | "TRAINER" | "BOTH"
  }
  ```
- **Response:** Updated user object

### Complete Profile
**POST** `/api/onboarding/profile`

- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "name": "string",
    "bio": "string (optional)",
    "city": "string",
    "country": "string",
    "languages": ["string"],
    "coachingMode": "string"
  }
  ```
- **Response:** Updated profile object

### Complete Trainer Profile
**POST** `/api/onboarding/trainer`

- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "specialties": ["string"],
    "yearsExperience": "number",
    "certifications": ["string"],
    "priceMin": "number",
    "priceMax": "number",
    "radiusKm": "number (optional)",
    "availabilityNotes": "string (optional)"
  }
  ```
- **Response:** Updated trainer profile object
- **Notes:** Only for users with TRAINER or BOTH role

### Complete Client Profile
**POST** `/api/onboarding/client`

- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "goals": ["string"],
    "experienceLevel": "string",
    "budgetMin": "number",
    "budgetMax": "number"
  }
  ```
- **Response:** Updated client profile object
- **Notes:** Only for users with CLIENT or BOTH role

### Complete Onboarding
**POST** `/api/onboarding/complete`

- **Auth Required:** Yes
- **Response:** Success confirmation
- **Notes:** Marks onboarding process as complete for the user

---

## Trainer Discovery Endpoints

### Get All Trainers
**GET** `/api/trainers`

- **Auth Required:** No
- **Query Parameters:**
  ```
  search: string (optional)
  city: string (optional)
  country: string (optional)
  coachingMode: string (optional)
  specialties: string[] (optional)
  priceMin: number (optional)
  priceMax: number (optional)
  language: string (optional)
  page: number (optional, default: 1)
  pageSize: number (optional)
  sort: string (optional)
  ```
- **Response:** Array of trainer objects with pagination
- **Notes:** Returns list of trainers matching filter criteria

### Get Trainer Details
**GET** `/api/trainers/:id`

- **Auth Required:** No (but checks session for `isFavorited`)
- **Response:**
  ```json
  {
    "trainer": {...},
    "plans": [...],
    "isFavorited": "boolean (if authenticated)"
  }
  ```
- **Notes:** Returns detailed trainer info, their plans, and favorite status if user is authenticated

---

## Conversation Endpoints

### Create Conversation
**POST** `/api/conversations`

- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "trainerId": "string"
  }
  ```
- **Response:** Conversation object
- **Notes:** Only clients can initiate conversations with trainers

### Get Conversations
**GET** `/api/conversations`

- **Auth Required:** Yes
- **Response:** Array of conversation objects for authenticated user
- **Notes:** Returns all conversations the user is part of

### Mark Conversation as Read
**POST** `/api/conversations/:id/read`

- **Auth Required:** Yes
- **Response:** Success confirmation
- **Notes:** Marks all messages in conversation as read

---

## Message Endpoints

### Get Messages
**GET** `/api/messages`

- **Auth Required:** Yes
- **Query Parameters:**
  ```
  conversationId: string
  ```
- **Response:** Array of message objects
- **Notes:** Returns all messages for a specific conversation

### Send Message
**POST** `/api/messages`

- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "conversationId": "string",
    "content": "string"
  }
  ```
- **Response:** Created message object
- **Notes:** Sends a message in an existing conversation

---

## Block/Report Endpoints

### Block User
**POST** `/api/block`

- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "blockedId": "string"
  }
  ```
- **Response:** Success confirmation
- **Notes:** Blocks a user from contacting

### Unblock User
**DELETE** `/api/block/:blockedId`

- **Auth Required:** Yes
- **Response:** Success confirmation
- **Notes:** Removes a block on a user

### Get Blocked Users
**GET** `/api/blocked`

- **Auth Required:** Yes
- **Response:** Array of blocked user IDs
- **Notes:** Returns list of users the authenticated user has blocked

### Report User
**POST** `/api/report`

- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "reportedId": "string",
    "category": "string",
    "details": "string (optional)"
  }
  ```
- **Response:** Success confirmation
- **Notes:** Submits a report about a user for moderation

---

## Training Plan Endpoints

### Get Trainer Plans
**GET** `/api/plans`

- **Auth Required:** Yes
- **Response:** Array of plan objects
- **Notes:** Returns all plans created by authenticated trainer

### Create Plan
**POST** `/api/plans`

- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "title": "string",
    "description": "string (optional)",
    "priceCents": "number",
    "currency": "string (optional)",
    "billingType": "string (optional)"
  }
  ```
- **Response:** Created plan object
- **Notes:** Only trainers can create plans

### Update Plan
**PATCH** `/api/plans/:id`

- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "title": "string (optional)",
    "description": "string (optional)",
    "priceCents": "number (optional)",
    "currency": "string (optional)",
    "billingType": "string (optional)"
  }
  ```
- **Response:** Updated plan object
- **Notes:** Only plan owner can update

---

## Stripe Endpoints

### Get Stripe Connect OAuth URL
**GET** `/api/stripe/connect`

- **Auth Required:** Yes
- **Response:**
  ```json
  {
    "oauthUrl": "string"
  }
  ```
- **Notes:** Trainers only; returns URL for Stripe Connect onboarding

### Stripe Connect Callback
**GET** `/api/stripe/callback`

- **Auth Required:** No
- **Query Parameters:**
  ```
  code: string
  state: string
  ```
- **Response:** Redirect to dashboard or error page
- **Notes:** OAuth redirect handler for Stripe Connect

### Get Stripe Connection Status
**GET** `/api/stripe/status`

- **Auth Required:** Yes
- **Response:**
  ```json
  {
    "connected": "boolean"
  }
  ```
- **Notes:** Returns whether authenticated trainer is connected to Stripe

### Stripe Webhook
**POST** `/api/stripe/webhook`

- **Auth Required:** No
- **Headers:** `stripe-signature` (for verification)
- **Webhook Events Handled:**
  - `checkout.session.completed` - Process completed payment
  - `checkout.session.expired` - Handle expired checkout session
- **Response:** Success confirmation
- **Notes:** Raw request body required; Stripe signature must be verified

---

## Checkout & Orders Endpoints

### Create Checkout
**POST** `/api/checkout`

- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "planId": "string"
  }
  ```
- **Response:**
  ```json
  {
    "checkoutUrl": "string"
  }
  ```
- **Notes:** Redirects client to Stripe checkout

### Create Order (Deprecated)
**POST** `/api/orders`

- **Status:** 410 Gone
- **Notes:** Deprecated; use POST `/api/checkout` instead

### Get Client Orders
**GET** `/api/orders`

- **Auth Required:** Yes
- **Response:** Array of orders where user is buyer
- **Notes:** Returns orders purchased by authenticated user

### Get Trainer Orders
**GET** `/api/orders/trainer`

- **Auth Required:** Yes
- **Response:** Array of orders where user is trainer
- **Notes:** Returns orders for services provided by authenticated trainer

---

## Favorites Endpoints

### Toggle Favorite
**POST** `/api/favorites/toggle`

- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "trainerId": "string"
  }
  ```
- **Response:** Success confirmation
- **Notes:** Adds or removes trainer from favorites

### Get Favorites
**GET** `/api/favorites`

- **Auth Required:** Yes
- **Response:** Array of favorited trainer objects
- **Notes:** Returns all trainers favorited by authenticated user

---

## Settings Endpoints

### Update Profile Settings
**PATCH** `/api/settings/profile`

- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "name": "string (optional)",
    "bio": "string (optional)",
    "city": "string (optional)",
    "country": "string (optional)",
    "languages": ["string"] (optional),
    "coachingMode": "string (optional)"
  }
  ```
- **Response:** Updated profile object

### Update Password
**PATCH** `/api/settings/password`

- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "currentPassword": "string",
    "newPassword": "string"
  }
  ```
- **Response:** Success confirmation
- **Notes:** Requires verification of current password

### Upload Avatar
**POST** `/api/settings/avatar`

- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "image": "string (base64 data URL)"
  }
  ```
- **Response:** Updated user object with avatar URL
- **Notes:** Maximum 5MB; should be base64 encoded data URL

### Update Trainer Profile Settings
**PATCH** `/api/settings/trainer-profile`

- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "specialties": ["string"] (optional),
    "yearsExperience": "number (optional)",
    "certifications": ["string"] (optional),
    "priceMin": "number (optional)",
    "priceMax": "number (optional)",
    "radiusKm": "number (optional)",
    "availabilityNotes": "string (optional)"
  }
  ```
- **Response:** Updated trainer profile object
- **Notes:** Only trainers can update

### Update Client Profile Settings
**PATCH** `/api/settings/client-profile`

- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "goals": ["string"] (optional),
    "experienceLevel": "string (optional)",
    "budgetMin": "number (optional)",
    "budgetMax": "number (optional)"
  }
  ```
- **Response:** Updated client profile object
- **Notes:** Only clients can update

---

## Dashboard Endpoints

### Get Client Dashboard
**GET** `/api/dashboard/client`

- **Auth Required:** Yes
- **Response:**
  ```json
  {
    "orders": [...],
    "favorites": [...]
  }
  ```
- **Notes:** Returns client's orders and favorited trainers

### Get Trainer Dashboard
**GET** `/api/dashboard/trainer`

- **Auth Required:** Yes
- **Response:**
  ```json
  {
    "leads": [...],
    "activeClients": [...],
    "orders": [...]
  }
  ```
- **Notes:** Returns trainer's conversation leads, active clients, and orders

### Get Client Profile
**GET** `/api/client-profile`

- **Auth Required:** Yes
- **Response:** Complete client profile object
- **Notes:** Full client profile information

### Get User Profile
**GET** `/api/profile`

- **Auth Required:** Yes
- **Response:** Complete user profile object
- **Notes:** General user profile information

### Get Trainer Profile
**GET** `/api/trainer-profile`

- **Auth Required:** Yes
- **Response:** Complete trainer profile object
- **Notes:** Full trainer profile information

---

## Legal Endpoints

### Accept Legal Document
**POST** `/api/legal/accept`

- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "documentType": "string",
    "version": "string"
  }
  ```
- **Response:** Success confirmation
- **Notes:** Records user acceptance of legal documents (terms, privacy policy, etc.)

### Get Legal Acceptances
**GET** `/api/legal/acceptances`

- **Auth Required:** Yes
- **Response:** Array of accepted documents with timestamps
- **Notes:** Returns history of user's legal document acceptances

---

## Statistics Endpoints

### Get Platform Stats
**GET** `/api/stats`

- **Auth Required:** No
- **Response:**
  ```json
  {
    "trainerCount": "number",
    "userCount": "number"
  }
  ```
- **Notes:** Public statistics about platform usage

---

## Error Responses

All endpoints return appropriate HTTP status codes:

- **200 OK** - Successful GET/POST/PATCH request
- **201 Created** - Successful resource creation
- **400 Bad Request** - Invalid request parameters or body
- **401 Unauthorized** - Missing or invalid authentication
- **403 Forbidden** - User lacks permission for this action
- **404 Not Found** - Resource does not exist
- **410 Gone** - Endpoint is deprecated
- **500 Internal Server Error** - Server error

Error responses typically include:
```json
{
  "error": "string",
  "message": "string (optional)"
}
```

---

## Authentication Notes

- Session-based authentication is used throughout the API
- Authentication headers are managed via session cookies
- Most endpoints that require auth will return 401 if no valid session exists
- Some endpoints perform optional authentication checks (noted in documentation)
