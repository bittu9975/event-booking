# 🎟️ EventBook — Event Booking System

A full-stack event booking platform built with **Spring Boot**, **MySQL**, and **React**.

---

## 🚀 Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts  |
| Backend  | Spring Boot 3, Spring Security (JWT)    |
| Database | MySQL 8                                 |
| Extras   | QR Code (ZXing), Email (Spring Mail)    |

---

## 📁 Project Structure

```
event-booking-system/
├── backend/        # Spring Boot application
├── frontend/       # React + Vite application
├── database/       # SQL setup scripts
└── docs/           # API documentation
```

---

## ⚙️ Setup Instructions

### 1. Database

```sql
-- Run database/schema.sql in MySQL Workbench or CLI
mysql -u root -p < database/schema.sql
```

### 2. Backend

Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.password=YOUR_MYSQL_PASSWORD
spring.mail.username=YOUR_GMAIL
spring.mail.password=YOUR_GMAIL_APP_PASSWORD
```

Then run:
```bash
cd backend
mvn spring-boot:run
# Starts on http://localhost:8080
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# Starts on http://localhost:5173
```

---

## 🔐 Demo Credentials

| Role  | Email                  | Password |
|-------|------------------------|----------|
| Admin | admin@eventbook.com    | admin123 |

Register any new account for a User role.

---

## 🌐 API Endpoints

### Auth
```
POST   /api/auth/register      — Register new user
POST   /api/auth/login         — Login, returns JWT
GET    /api/auth/me            — Get current user (auth required)
```

### Events
```
GET    /api/events             — List events (search, category, page params)
GET    /api/events/{id}        — Get event details
POST   /api/events             — Create event (ADMIN)
PUT    /api/events/{id}        — Update event (ADMIN)
DELETE /api/events/{id}        — Delete event (ADMIN)
```

### Bookings
```
POST   /api/bookings           — Create booking
GET    /api/bookings/my        — My bookings
DELETE /api/bookings/{id}      — Cancel booking
```

### Admin
```
GET    /api/admin/stats        — Dashboard stats + charts
GET    /api/admin/bookings     — All bookings
```

---

## ✨ Features

- **JWT Authentication** — Secure login/register with role-based access
- **Event Discovery** — Search, filter by category, paginated listing
- **Booking System** — Seat availability check, booking confirmation
- **QR Code Tickets** — Auto-generated QR code per booking
- **Email Notifications** — Confirmation + cancellation emails (HTML template)
- **Admin Dashboard** — Analytics charts (bar, pie), event CRUD, all bookings
- **Cancellation** — Users can cancel and seats are restored

---

## 🚢 Deployment

| Service  | Recommended Platform         |
|----------|------------------------------|
| Backend  | Railway / Render / AWS EC2   |
| Frontend | Vercel / Netlify             |
| Database | PlanetScale / AWS RDS        |

---

## 📧 Gmail SMTP Setup

1. Enable 2FA on your Google account
2. Go to **Google Account → Security → App Passwords**
3. Generate an app password for "Mail"
4. Use that 16-char password in `application.properties`
