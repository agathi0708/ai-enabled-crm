# Module 2 — Contacts & Lead Management

## AI-Enabled CRM Application

Module 2 is responsible for **Contacts & Lead Management** in the AI-Enabled CRM Application.

This module allows authenticated users to create, view, update, delete, search, filter, import, and manage contacts and leads. It also provides the lead-to-deal conversion handoff to the Deals module.

---

## Table of Contents

- [Module Overview](#module-overview)
- [Responsibilities](#responsibilities)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Module Architecture](#module-architecture)
- [Project Structure](#project-structure)
- [Contact Data Model](#contact-data-model)
- [API Endpoints](#api-endpoints)
- [Authentication and Authorization](#authentication-and-authorization)
- [Contact Management](#contact-management)
- [Search and Filtering](#search-and-filtering)
- [CSV Import](#csv-import)
- [Lead to Deal Conversion](#lead-to-deal-conversion)
- [Frontend Components](#frontend-components)
- [Validation](#validation)
- [Error Handling](#error-handling)
- [Pagination](#pagination)
- [Testing](#testing)
- [Security Considerations](#security-considerations)
- [Running the Module](#running-the-module)
- [Module Status](#module-status)

---

# Module Overview

The Contacts & Lead Management module is one of the core modules of the CRM application.

It manages the complete lifecycle of contacts and leads:

```text
Create Contact
      ↓
View Contact
      ↓
Search / Filter
      ↓
Edit Contact
      ↓
Manage Status & Tags
      ↓
Convert Lead
      ↓
Deal
```

The module is designed to work with authenticated users and ensures that users can access only their own contact records.

---

# Responsibilities

The primary responsibilities of Module 2 are:

- Contact creation
- Contact viewing
- Contact editing
- Contact deletion
- Contact status management
- Tag management
- Search functionality
- Status filtering
- Tag filtering
- Server-side pagination
- CSV contact import
- CSV validation
- Lead-to-deal conversion
- Authentication integration
- Owner-based data access
- Contact activity integration

---

# Features

## 1. Contact CRUD

Users can:

- Create contacts
- View contact details
- Update contact information
- Delete contacts

Supported contact information includes:

- Name
- Company
- Email
- Phone
- Status
- Tags
- Source
- Notes

## 2. Contact Status

Contacts can have the following statuses:

```text
new
hot
warm
cold
converted
```

When creating a contact, the normal lead statuses are:

```text
new
hot
warm
cold
```

The `converted` status is used when a lead has been converted into a deal.

## 3. Tags

Contacts can have multiple tags.

Example:

```text
priority
demo
customer
website
follow-up
```

Tags are stored as an array in the database.

Example:

```json
{
  "tags": ["priority", "demo"]
}
```

---

# Technology Stack

## Frontend

- React
- JavaScript
- Vite
- Tailwind CSS

## Backend

- Node.js
- Express.js
- REST API

## Database

- PostgreSQL

## Authentication

- JWT (JSON Web Token)

## File Upload

- Multer

## CSV Processing

- csv-parse

---

# Module Architecture

The module follows a layered backend architecture.

```text
React Frontend
       |
       v
REST API
       |
       v
Routes
       |
       v
Controller
       |
       v
Service
       |
       v
Repository
       |
       v
PostgreSQL
```

This separation keeps routing, business logic, validation, and database operations independent.

---

# Project Structure

## Backend

```text
backend/
└── contacts/
    ├── contacts.controller.js
    ├── contacts.import.service.js
    ├── contacts.repository.js
    ├── contacts.routes.js
    ├── contacts.service.js
    └── contacts.validation.js
```

### `contacts.routes.js`

Defines the REST API routes for contacts.

### `contacts.controller.js`

Handles HTTP requests and responses.

### `contacts.service.js`

Contains contact-related business logic.

### `contacts.repository.js`

Handles PostgreSQL database operations.

### `contacts.validation.js`

Validates contact input and contact IDs.

### `contacts.import.service.js`

Processes CSV files and validates imported rows.

---

# Contact Data Model

The contacts table contains the following fields:

| Field | Type | Description |
|---|---|---|
| id | UUID | Unique contact identifier |
| owner_id | UUID | Authenticated user's ID |
| name | VARCHAR(120) | Contact name |
| company | VARCHAR(160) | Company name |
| email | VARCHAR(160) | Email address |
| phone | VARCHAR(30) | Phone number |
| status | VARCHAR(20) | Contact status |
| tags | TEXT[] | Contact tags |
| source | VARCHAR(80) | Lead source |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

---

# API Endpoints

Base URL:

```text
/api/v1/contacts
```

## List Contacts

```http
GET /api/v1/contacts
```

Supports:

- Pagination
- Search
- Status filtering
- Tag filtering

Example:

```http
GET /api/v1/contacts?page=1&limit=10&status=hot&search=John
```

## Create Contact

```http
POST /api/v1/contacts
```

Example request:

```json
{
  "name": "John Doe",
  "company": "ABC Technologies",
  "email": "john@example.com",
  "phone": "9876543210",
  "status": "new",
  "tags": ["priority", "website"],
  "source": "Website",
  "notes": "Interested in product demo"
}
```

## Get Contact

```http
GET /api/v1/contacts/:id
```

Returns the details of a specific contact.

## Update Contact

```http
PUT /api/v1/contacts/:id
```

Example:

```json
{
  "company": "Updated Company",
  "status": "hot"
}
```

## Delete Contact

```http
DELETE /api/v1/contacts/:id
```

Successful deletion returns:

```text
204 No Content
```

## Import Contacts

```http
POST /api/v1/contacts/import
```

The endpoint accepts a CSV file using the multipart form field:

```text
file
```

## Convert Contact to Deal

```http
POST /api/v1/contacts/:id/convert
```

This converts a contact/lead into a deal.

Example flow:

```text
Contact
  ↓
Convert
  ↓
Deal created
  ↓
Contact status = converted
```

## Contact Activities

```http
GET /api/v1/contacts/:id/activities
```

This endpoint allows the contact detail page to retrieve activities associated with the contact.

---

# Authentication and Authorization

All contact operations require authentication.

The routes use the authentication middleware:

```javascript
requireAuth
```

The client sends the JWT using the Authorization header:

```http
Authorization: Bearer <access_token>
```

The authenticated user's ID is used as the contact owner.

---

# Owner-Based Access Control

Contacts are always accessed using the authenticated user's owner ID.

For example:

```sql
WHERE id = $1
  AND owner_id = $2
```

This prevents a user from accessing another user's contacts by changing the contact ID.

The same ownership concept is used during lead-to-deal conversion.

---

# Contact Management

## Creating a Contact

The user opens the **Add Contact** form and enters the required information.

The frontend sends the data to:

```text
POST /api/v1/contacts
```

The request passes through:

```text
Authentication
      ↓
Controller
      ↓
Validation
      ↓
Service
      ↓
Repository
      ↓
PostgreSQL
```

## Updating a Contact

Users can edit:

- Name
- Company
- Email
- Phone
- Status
- Tags
- Source
- Notes

The frontend sends the update request to:

```text
PUT /api/v1/contacts/:id
```

## Deleting a Contact

When the user deletes a contact:

```text
DELETE /api/v1/contacts/:id
```

The backend verifies ownership before deleting the record.

---

# Search and Filtering

The contacts page provides:

## Search

Users can search by:

- Contact name
- Company name

The frontend uses a **300 ms debounce** before sending the search request.

This prevents unnecessary API requests while the user is typing.

## Status Filter

Users can filter contacts by:

```text
All Statuses
New
Hot
Warm
Cold
Converted
```

## Tag Filter

Users can filter contacts using contact tags.

Example:

```text
priority
demo
customer
```

---

# Pagination

The contacts list uses server-side pagination.

The frontend currently requests:

```text
limit = 10
```

The backend supports configurable pagination with a maximum limit of 100.

Example:

```http
GET /api/v1/contacts?page=1&limit=10
```

The response contains:

```text
data
meta
error
```

The `meta` section provides pagination information such as the total number of records.

---

# CSV Import

The module supports bulk contact creation through CSV files.

## File Restrictions

```text
Maximum file size: 5 MB
Maximum rows: 5000
File type: CSV
```

The upload uses Multer with memory storage.

## Minimum CSV Requirement

The CSV must contain:

```text
name
```

Example:

```csv
name,company,email,phone,status,tags,source,notes
John Doe,ABC Ltd,john@example.com,9876543210,new,"priority,demo",Website,Interested in demo
Jane Smith,XYZ Ltd,jane@example.com,9876543211,hot,"customer",Referral,Existing customer
```

## CSV Processing Flow

```text
Select CSV
     ↓
Frontend file validation
     ↓
Upload to API
     ↓
Multer
     ↓
CSV parser
     ↓
Row validation
     ↓
Valid rows → Database
Invalid rows → Errors
```

Malformed rows do not stop the entire import process.

The import response reports:

- Number of imported records
- Number of failed records
- Validation errors

---

# Lead to Deal Conversion

One of the important features of Module 2 is lead-to-deal conversion.

When a user converts a contact:

```text
POST /api/v1/contacts/:id/convert
```

The backend performs the conversion inside a database transaction.

## Conversion Flow

```text
Authenticated User
       ↓
Verify Contact Ownership
       ↓
Lock Contact
       ↓
Check Existing Deal
       ↓
Create Deal
       ↓
Update Contact Status
       ↓
Commit Transaction
```

The generated deal name follows this format:

```text
<Contact Name> - <Company>
```

For example:

```text
Suresh Mani - Sunrise Retail
```

After successful conversion:

```text
Contact Status = converted
Deal Stage = new
```

The conversion operation also prevents duplicate deals for the same contact.

---

# Frontend Components

The Contacts frontend is organized into reusable React components.

```text
frontend/src/features/contacts/

├── ContactsPage.jsx
├── ContactsTable.jsx
├── ContactDetail.jsx
├── ContactForm.jsx
├── EditContactForm.jsx
└── ImportContacts.jsx
```

## `ContactsPage`

Responsible for:

- Loading contacts
- Search
- Filtering
- Pagination
- Opening forms
- Opening contact details
- Refreshing contact data

## `ContactsTable`

Displays contact records in a table.

It supports:

- Contact selection
- Status changes
- Optimistic status updates
- Error rollback

## `ContactDetail`

Displays detailed information about a contact.

It also provides:

- Edit
- Delete
- Activity information
- Lead conversion

## `ContactForm`

Used to create new contacts.

## `EditContactForm`

Used to update existing contacts.

## `ImportContacts`

Provides the CSV import interface.

---

# Validation

The backend validates all important contact inputs.

## Name

Required:

```text
1–120 characters
```

## Email

Email format is validated before storing the value.

## Status

Allowed values:

```text
new
hot
warm
cold
converted
```

## Tags

Tags must be an array containing non-empty strings.

## Contact ID

Contact IDs are validated as UUIDs.

---

# Error Handling

The API follows a consistent response envelope:

```json
{
  "data": {},
  "meta": {},
  "error": null
}
```

Validation errors use a dedicated error code:

```text
VALIDATION_ERROR
```

Authentication failures return an unauthorized response.

Missing contacts return:

```text
NOT_FOUND
```

Duplicate conversion conflicts are handled separately.

---

# Optimistic Status Updates

When a user changes a contact status in the table, the frontend updates the UI immediately.

Example:

```text
New
 ↓
Hot
```

If the backend update fails:

```text
Hot
 ↓
Rollback
 ↓
New
```

This provides a faster user experience while maintaining consistency with the backend.

---

# Security Considerations

The module includes several security measures:

- JWT authentication
- Authenticated owner identification
- Owner-scoped database queries
- Parameterized SQL queries
- UUID validation
- Request validation
- CSV file type validation
- CSV file size restriction
- CSV row limit
- Duplicate conversion protection

The frontend does not send arbitrary `owner_id` values when creating contacts. The backend determines ownership from the authenticated user.

---

# Testing

Module 2 was functionally tested after integration.

## Tested Features

| Test | Result |
|---|---|
| User login | PASS |
| Contact list loading | PASS |
| Create contact | PASS |
| Search contact | PASS |
| Status filter | PASS |
| Tag filter | PASS |
| Clear filters | PASS |
| Update status | PASS |
| Status persistence after refresh | PASS |
| Contact detail | PASS |
| Edit contact | PASS |
| Edit persistence after refresh | PASS |
| Delete contact | PASS |
| CSV import | PASS |
| Lead-to-deal conversion | PASS |

### CSV Test Result

```text
Imported: 4
Failed:   0
```

### Lead Conversion Test

A contact was successfully converted into a deal.

The resulting contact status became:

```text
converted
```

and the generated deal started at:

```text
new
```

---

# Build and Code Validation

The project was checked using Node.js syntax validation.

Backend JavaScript files passed syntax checking.

The frontend production build also completed successfully using:

```bash
npm run build
```

The production build completed successfully.

---

# Running the Module

## 1. Clone the Repository

```bash
git clone https://github.com/agathi0708/ai-enabled-crm.git
```

```bash
cd ai-enabled-crm
```

## 2. Install Backend Dependencies

```bash
cd backend
npm install
```

## 3. Configure Environment Variables

Create the backend environment configuration according to the project's existing `.env` setup.

Required configuration includes the PostgreSQL database connection and JWT configuration.

Do not commit `.env` files or secrets to GitHub.

## 4. Start Backend

From the backend directory:

```bash
npm start
```

The backend runs on:

```text
http://localhost:5000
```

## 5. Start Frontend

Open another terminal and navigate to:

```bash
cd frontend
```

Install dependencies if required:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend runs on the configured Vite development port.

---

# API Base URL

The frontend communicates with:

```text
/api/v1
```

Contact APIs use:

```text
/api/v1/contacts
```

---

# Module 2 Responsibilities in the Overall CRM

Module 2 integrates with other CRM modules.

```text
                Authentication
                      |
                      v
             Contacts & Leads
              [Module 2]
                /       \
               /         \
              v           v
        Activities      Deals
        Integration    Conversion
```

Module 2 provides contact and lead information to the rest of the CRM while maintaining ownership and authentication rules.

---

# Git

Module 2 development was completed and integrated into the main branch.

The module was developed using a feature branch and subsequently integrated into:

```text
main
```

Repository:

```text
ai-enabled-crm
```

---

# Module Status

## ✅ Module 2 — Complete

The Contacts & Lead Management module has been implemented, tested, reviewed, and integrated with the main project.

Completed functionality:

```text
✅ Contact CRUD
✅ Contact validation
✅ Tags
✅ Status management
✅ Search
✅ Filtering
✅ Pagination
✅ CSV import
✅ Lead-to-deal conversion
✅ Authentication
✅ Owner-based access control
✅ Contact activities integration
✅ Frontend UI
✅ Backend REST APIs
✅ PostgreSQL integration
✅ Testing
✅ Git integration
```

---

# Author

**Agathiyan R.K.**

**Role:** Module 2 — Contacts & Lead Management

**Project:** AI-Enabled CRM Application

**Module:** Contacts & Lead Management
