# Smart Campus Operations System

A full-stack web application for managing campus resources, bookings, incident tickets, and notifications — built for the IT3030 Programming and Frameworks module (2026).

---

## Table of Contents

- [Project Overview](#project-overview)
- [Team Members & Contributions](#team-members--contributions)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
- [Running the Application](#running-the-application)
- [API Testing with Postman](#api-testing-with-postman)
- [User Roles](#user-roles)
- [Features](#features)

---

## Project Overview

The Smart Campus Operations System streamlines day-to-day campus management by providing:

- **Students/Users** — book campus resources, report incidents, track their requests
- **Administrators** — manage resources, approve/reject bookings, oversee incident tickets, manage users
- **Technicians** — receive assigned tickets, update repair status, check in bookings via QR code

Authentication is handled entirely through **Google OAuth2** — no passwords required. Role-based access control ensures each user only sees and does what their role permits.

---

## Team Members & Contributions

| Student ID | Name | Module Contribution |
|---|---|---|
| **IT23374324** | Mathumitha.E| Notifications system · Role management · OAuth2 integration improvements · **Notification preferences (enable/disable per category)** *(Acceptable Innovation)* |
| **IT23164376** | Wanasinghe W M T P K  | Incident ticket system · File attachments · Technician assignment & status updates |
| **IT23146556** | Wickramarathne SB | Facilities catalogue · Resource management endpoints · Image upload for resources |
| **IT23153240** | Meedeniya M K J A | Booking workflow · Conflict checking | Admin user approve

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Java | 21 | Core language |
| Spring Boot | 3.5.13 | REST API framework |
| Spring Security | — | Authentication & authorization |
| Spring Data JPA | — | Database ORM |
| MySQL | 8+ | Relational database |
| Google OAuth2 | — | User authentication |
| JWT (jjwt) | 0.12.6 | Stateless session tokens |
| Lombok | — | Boilerplate reduction |
| Maven | — | Build tool |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | — | Build tool & dev server |
| Tailwind CSS | 4 | Styling |
| React Router | 7 | Client-side routing |
| Axios | — | HTTP client |
| react-qr-code | — | QR code generation |
| html5-qrcode | — | QR code scanning |

---

## Project Structure

```
it3030-paf-2026-smart-campus-operations/
├── back-end/                          # Spring Boot API
│   └── src/main/java/com/smartcampus/
│       ├── config/                    # Security, CORS, data seeding
│       ├── controller/                # REST endpoints
│       ├── service/                   # Business logic
│       ├── model/                     # JPA entities
│       ├── repository/                # Database queries
│       ├── dto/                       # Request/response objects
│       ├── exception/                 # Custom exceptions
│       └── security/                  # JWT, OAuth2 handlers
│
├── front-end/                         # React + Vite SPA
│   └── src/
│       ├── pages/                     # Full page components
│       ├── components/                # Reusable UI components
│       ├── services/                  # API call functions
│       └── context/                   # Auth context
│
├── SmartCampus.postman_collection.json  # API test collection
└── README.md
```

---

## Prerequisites

Make sure you have the following installed:

- **Java 21** — [Download](https://adoptium.net/)
- **Maven 3.9+** — bundled with the project (`./mvnw`)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **MySQL 8+** — [Download](https://dev.mysql.com/downloads/)
- **Git**
- A **Google Cloud Console** project with OAuth2 credentials

---

## Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Vishwaabeyrathna/it3030-paf-2026-smart-campus-y3s2-we-64.git
cd it3030-paf-2026-smart-campus-operations
```

### 2. Set Up the Database using MySQL

Open MySQL and create the database:

```sql
CREATE DATABASE smart_campus;
```

> The application auto-creates all tables on first boot via JPA (`ddl-auto=update`).

### 3. Configure the Backend

Copy the example properties file:

```bash
cp back-end/src/main/resources/application.properties.example \
   back-end/src/main/resources/application.properties
```

Open `application.properties` and fill in your values:

```properties
# Database
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD

# Google OAuth2
# Get from: https://console.cloud.google.com → APIs & Services → Credentials
spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET

# First admin account (your Google email — promoted to ADMIN on first boot)
app.admin.email=your-google-email@gmail.com
app.admin.name=Super Admin

# JWT Secret (generate with: openssl rand -hex 32)
app.jwt.secret=YOUR_JWT_SECRET_HEX_64_CHARS

# QR Check-in HMAC secret
app.checkin.hmacSecret=YOUR_CHECKIN_SECRET
```

### 4. Set Up Google OAuth2 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → **APIs & Services** → **Credentials**
3. Create **OAuth 2.0 Client ID** → Web application
4. Add Authorized redirect URIs:
   ```
   http://localhost:8080/login/oauth2/code/google
   ```
5. Copy the **Client ID** and **Client Secret** into `application.properties`

### 5. Install Frontend Dependencies

```bash
cd front-end
npm install
npm run  dev
```

---

## Running the Application

### Start the Backend

```bash
cd back-end
./mvnw spring-boot:run
```

Backend runs at: `http://localhost:8080`

### Start the Frontend

```bash
cd front-end
npm run dev
```

Frontend runs at: `http://localhost:5173`

### First Boot

1. Open `http://localhost:5173` in your browser
2. Click **Login with Google**
3. Sign in with the Google account you set as `app.admin.email`
4. You are automatically promoted to **ADMIN**
5. Use the Admin Dashboard to assign roles to other users

---

## API Testing with Postman

A complete Postman collection is included: `SmartCampus.postman_collection.json`

### Import the Collection

1. Open Postman
2. Click **Import** → drag and drop `SmartCampus.postman_collection.json`
3. Collection appears with all 51 requests across 8 folders

### Get Your JWT Token

1. Login via the frontend (`http://localhost:5173`)
2. Press `F12` → Console tab → run:
```js
copy(localStorage.getItem('token'))
```
3. Token is copied to clipboard automatically

### Set the Token in Postman

1. Click the collection → **Variables** tab
2. Paste token into `token` → **Current Value**
3. All requests now use it automatically

### Collection Folders

| Folder | Requests | Role Required |
|---|---|---|
| 🔐 Auth | Get current user | Any |
| 👤 Profile | Update profile, photo | Any |
| 👥 Admin — Users | List, edit, assign roles, delete | ADMIN |
| 📦 Resources | CRUD, image upload, availability | ADMIN / Any |
| 🏫 User — Resources | Browse active resources | Any |
| 📅 Bookings | Create, approve, reject, QR check-in | USER / ADMIN |
| 🔔 Notifications | List, read, delete, preferences | Any |
| 🎫 Tickets | Create, assign, comment, update | Any / ADMIN / TECHNICIAN |

---

## User Roles

| Role | Permissions |
|---|---|
| **USER** | Book resources · Report incidents · View own bookings & tickets · Manage profile |
| **ADMIN** | All USER permissions · Manage all bookings · Manage resources · Assign technicians · Manage users · View analytics |
| **TECHNICIAN** | View assigned tickets · Update ticket status · Add comments · QR check-in bookings |

> Roles are assigned by an ADMIN through the Admin Dashboard or via `PATCH /api/admin/users/{id}/role`.

---

## Features

### Authentication & Authorization (IT23374324)
- Google OAuth2 single sign-on — no passwords
- JWT tokens for stateless API security
- Role-based access control (USER / ADMIN / TECHNICIAN)
- Automatic admin seeding on first boot

### Notification System (IT23374324)
- Real-time notification bell with unread count
- Auto-triggered notifications for bookings and tickets
- Mark as read / delete individual or all
- **Notification Preferences** *(Acceptable Innovation)* — users can enable/disable specific notification categories (e.g., disable `BOOKING_CREATED` while keeping `BOOKING_APPROVED`)

### Incident Ticket System (IT23164376)
- Users submit incident tickets with category, priority, location, description
- Optional photo attachment per ticket
- Admin assigns tickets to technicians
- Technicians update status (`OPEN` → `IN_PROGRESS` → `RESOLVED`)
- Threaded comments between user, technician, and admin
- Notifications sent at each status change

### Resource Management (IT23146556)
- Full CRUD for campus resources (rooms, labs, equipment)
- Image upload per resource
- Fields: name, type, capacity, location, status, description, amenities
- Paginated browsing with search and filter by type/status
- Availability check endpoint
- Resource usage summary for admin analytics
- Separate user-facing browse view (active resources only)

### Booking System (IT23153240)
- Users book resources with date, time, purpose, attendee count
- Conflict detection — prevents double-booking same resource same time slot
- Admin approves or rejects bookings (rejection requires a reason)
- Users can cancel PENDING or APPROVED bookings
- Users can edit PENDING bookings
- Booking analytics — total, approved, pending, top resources, peak hours
- **QR Code Check-In** *(Acceptable Innovation)* — approved bookings generate a signed QR token; admin/technician scans to mark `CHECKED_IN`

---

## Environment Variables Reference

| Property | Description |
|---|---|
| `spring.datasource.username` | MySQL username |
| `spring.datasource.password` | MySQL password |
| `spring.security.oauth2.client.registration.google.client-id` | Google OAuth2 Client ID |
| `spring.security.oauth2.client.registration.google.client-secret` | Google OAuth2 Client Secret |
| `app.admin.email` | Google email to seed as first ADMIN |
| `app.jwt.secret` | JWT signing secret (64-char hex) |
| `app.checkin.hmacSecret` | HMAC secret for QR check-in token signing |

---

## Security Notes that required 

- `application.properties` is excluded from git via `.gitignore` — never commit it
- Uploaded files (`uploads/`) are excluded from git
- All admin endpoints require `ROLE_ADMIN` — verified server-side
- JWT tokens expire after 24 hours (`86400000ms`)

---

*IT3030 — Programming and Frameworks | Group Y3S2_WD | 2026*
