# Desk2Dine 🍽️

> Faculty Canteen Order Platform — A full-stack web application built with Spring Boot, MySQL, and vanilla HTML/CSS/JS featuring a Flipkart-inspired UI design.

[![GitHub](https://img.shields.io/badge/GitHub-chunnu-kumar01%2FDesk2dine-181717?logo=github&logoColor=white)](https://github.com/chunnu-kumar01/Desk2dine)

![Java 26](https://img.shields.io/badge/Java-26-orange?logo=java&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6db344?logo=spring&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-3.9.6-C71A36?logo=apache-maven&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## ✨ Features

### 🎨 Flipkart-Style UI
- **Blue Header (#2874F0)** — Google's Roboto font, clean card design
- **Responsive Layout** — Works on desktop, tablet, and mobile
- **Bottom Navigation** — Mobile-first navigation bar
- **Smooth Animations** — Fade-in, slide-up, badge-bounce effects
- **Skeleton Loading** — Shimmer loading states while fetching data

### 👨‍💻 Faculty Portal
- Browse canteen menu with categories and search
- Add items to cart with quantity control
- Select delivery location
- Place orders and track status in real-time
- Mark orders as received
- View order history and favourites
- Push notifications

### 🔐 Admin Portal
- View all orders with status filtering and pagination
- Mark orders as delivered
- Receive orders from faculty
- Generate bills automatically (sequential bill numbers)
- Manage menu items (CRUD)
- Manage categories (CRUD)
- Manage delivery locations (CRUD)
- Browse all users (read-only)
- Audit log trail

### 🔒 Security
- **Session-based authentication** (no JWT complexity)
- **BCrypt password hashing** (jBCrypt)
- **Custom `@RequireRole` annotation** — Role-based authorization
- **AuthInterceptor** — Intercepts all `/api/**` requests, validates session + role
- **Ownership enforcement** — Faculty can only access their own orders
- **Admin-only endpoints** — Bill generation, order management, menu CRUD

### 📊 Order Lifecycle
```
PLACED → DELIVERED → RECEIVED → BILLED → PAID → COMPLETED
    ↓           ↓            ↓         ↓        ↓
 Faculty    Admin       Faculty    Admin    Faculty
 Place      Deliver     Receive    Generate Pay    Admin
 Order                    (bill)      Bill      (confirm)
```

### 💾 Payment System
- Auto-generated sequential bill numbers
- Payment record creation on bill generation
- Cash payment confirmation
- Bill number tracking on every order

---

## 🏗️ Architecture

```
src/main/
├── java/com/desk2dine/
│   ├── controller/          # REST Controllers (Order, Auth, Menu, etc.)
│   ├── service/             # Business Logic Layer
│   ├── repository/          # JDBC + HikariCP Data Access
│   ├── entity/              # JPA-style Entity Classes
│   ├── dto/                 # Request/Response DTOs
│   ├── security/            # AuthInterceptor, @RequireRole, Role enum
│   └── config/              # SchemaInitializer, AdminBootstrap, WebConfig
├── resources/
│   ├── static/              # Frontend: HTML, CSS, JS
│   │   ├── css/style.css    # Flipkart-style CSS (1395+ lines)
│   │   ├── js/              # Modular JS (common, admin, cart, etc.)
│   │   ├── *.html           # 11+ pages
│   │   └── index.html       # Splash screen
│   ├── db/schema.sql        # MySQL schema (18 tables)
│   └── application.properties
```

**Frontend**: Vanilla HTML/CSS/JS with NO frameworks — zero dependencies
**Backend**: Raw JDBC via HikariCP connection pool — NO JPA/Hibernate
**Session**: Server-side sessions with `SessionUtil` (no JWT tokens)

---

## 📋 Database Schema (18 tables)

| Table | Description |
|-------|-------------|
| `users` | Login credentials, roles (FACULTY/ADMIN) |
| `admin` | Admin-specific profile data |
| `faculty` | Faculty-specific profile data |
| `categories` | Menu categories (Breakfast, Lunch, Snacks...) |
| `menu_items` | Available food items |
| `orders` | Order records with lifecycle status |
| `order_items` | Line items within an order |
| `payments` | Payment records with bill numbers |
| `bills` | Bill generation history |
| `notifications` | In-app alerts for order updates |
| `favourites` | Faculty-starred menu items |
| `delivery_locations` | Rooms/blocks for delivery |
| `password_reset_tokens` | Token-based password recovery |
| `bill_number_sequence` | Auto-incrementing bill counter |
| `audit_logs` | Append-only security trail |
| `cart` | Session-based cart (localStorage in JS) |

---

## 🚀 Quick Start

### Prerequisites
- **Java 26** (Oracle JDK) — [Download](https://www.oracle.com/java/technologies/downloads/)
- **Maven 3.9.6** — [Download](https://maven.apache.org/download.cgi)
- **MySQL 8.0** — [Download](https://dev.mysql.com/downloads/mysql/)
- **Password**: `442006c`

### Setup

```bash
# 1. Start MySQL (password: 442006c)
# 2. Configure application.properties (DB: desk2dine, port: 8082)

# 3. Build & Run
cd desk2dine
mvn clean compile
mvn spring-boot:run

# 4. App runs at http://localhost:8082
```

### Demo Accounts

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** | `admin@desk2dine.com` | `Admin@123` | Full admin panel |
| **Faculty** | `testfaculty@desk2dine.com` | `Test@1234` | Browse, order, track |

---

## 🎨 Design System (CSS Variables)

```css
--fk-blue: #2874F0;        /* Flipkart Blue — header, CTAs */
--fk-blue-dark: #1a5fd4;   /* Dark blue — hover states */
--fk-yellow: #FFE11B;      /* Accent — logo, hero CTA */
--fk-green: #26a541;       /* Success — Add to Cart buttons */
--fk-red: #ff6161;         /* Error, unavailable */
--fk-bg: #f1f3f6;          /* Background — light gray */
--fk-text: #212121;        /* Primary text */
--fk-text-light: #878787;  /* Secondary text */
--fk-border: #e0e0e0;      /* Borders */
--fk-radius: 2px;          /* Sharp corners */
--fk-radius-card: 4px;     /* Card corners */
```

---

## 📁 Project Structure

```
desk2dine/
├── src/main/
│   ├── java/com/desk2dine/    # Backend Java source
│   ├── resources/static/      # Frontend assets
│   │   ├── css/style.css      # Flipkart theme
│   │   ├── js/                # Modular JavaScript
│   │   └── *.html             # 11 pages
│   ├── resources/db/schema.sql # Database schema
│   └── resources/application.properties
├── pom.xml                     # Maven config
├── .gitignore                  # Git ignore rules
├── .gitkeep
└── README.md                   # This file
```

---

## 🔐 Security Architecture

### AuthInterceptor Flow
```
Every /api/** Request
    │
    ├─ Is it a public path? (signup/login/forgot-password/reset-password)
    │   └─ YES → Allow through
    │
    ├─ Is there an active session?
    │   └─ NO → Return 401 Unauthorized → Redirect to login
    │
    ├─ Does the endpoint have @RequireRole?
    │   ├─ YES → Does user's role match?
    │   │   ├─ YES → Proceed to controller
    │   │   └─ NO → Return 403 Forbidden
    │   └─ NO → Proceed to controller
```

### Role-Based Access
| Endpoint | Required Role |
|----------|--------------|
| `/api/auth/login` | Public |
| `/api/auth/signup` | Public (→ FACULTY only) |
| `/api/orders` (POST) | FACULTY |
| `/api/orders` (GET) | ADMIN only |
| `/api/orders/{id}/deliver` | ADMIN only |
| `/api/orders/{id}/bill` | ADMIN only |
| `/api/orders/{id}/pay` | Faculty (owner only) |
| `/api/menu-items` (POST) | ADMIN only |
| `/api/categories` (POST) | ADMIN only |

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Language** | Java 26 |
| **Framework** | Spring Boot 3.x |
| **Database** | MySQL 8.0 |
| **Connection Pool** | HikariCP (raw JDBC) |
| **Password Hashing** | jBCrypt |
| **Frontend** | Vanilla HTML5, CSS3, ES6+ JavaScript |
| **Font** | Roboto (Google Fonts) |
| **Icons** | Material Symbols (Google) |
| **Build Tool** | Maven 3.9.6 |
| **Tunneling** | Cloudflare Tunnel |

---

## 🌐 Live Demo

> Access via Cloudflare tunnel: `https://stands-bush-game-towns.trycloudflare.com`

---

## 📝 API Endpoints Summary

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/api/auth/signup` | Register new faculty | Public |
| POST | `/api/auth/login` | Login | Public |
| POST | `/api/auth/logout` | Logout | Any |
| GET | `/api/auth/me` | Get current user | Any |
| POST | `/api/orders` | Place new order | FACULTY |
| GET | `/api/orders/mine` | Get my orders | FACULTY |
| GET | `/api/orders` | Get all orders | ADMIN |
| GET | `/api/orders/{id}` | Get order details | Any (owner or admin) |
| PATCH | `/api/orders/{id}/deliver` | Mark delivered | ADMIN |
| PATCH | `/api/orders/{id}/receive` | Mark received | FACULTY |
| PATCH | `/api/orders/{id}/bill` | Generate bill | ADMIN |
| PATCH | `/api/orders/{id}/pay` | Confirm payment | FACULTY |
| PATCH | `/api/orders/{id}/complete` | Complete order | ADMIN |
| GET/POST | `/api/menu-items` | Browse/Add menu items | FACULTY / ADMIN |
| PUT/DELETE | `/api/menu-items/{id}` | Edit/Delete menu item | ADMIN |
| GET/POST | `/api/categories` | Browse/Add categories | FACULTY / ADMIN |
| PUT/DELETE | `/api/categories/{id}` | Edit/Delete category | ADMIN |
| GET/POST | `/api/delivery-locations` | Browse/Add locations | FACULTY / ADMIN |
| PUT/DELETE | `/api/delivery-locations/{id}` | Edit/Delete location | ADMIN |
| GET | `/api/favourites` | Get user favourites | FACULTY |
| POST/DELETE | `/api/favourites/{id}` | Add/Remove favourite | FACULTY |
| GET | `/api/notifications` | Get notifications | FACULTY |
| GET | `/api/notifications/unread-count` | Get unread count | Any |
| GET | `/api/admin/users` | Browse all users | ADMIN |
| GET | `/api/audit-logs` | Get audit logs | ADMIN |

---

## 🤝 Contributing

1. **Clone**: `git clone https://github.com/chunnu-kumar01/Desk2dine.git`
2. **Branch**: `git checkout -b feature/AmazingFeature`
3. **Commit**: `git commit -m 'Add some AmazingFeature'`
4. **Push**: `git push origin feature/AmazingFeature`
5. **PR**: Open a Pull Request on [GitHub](https://github.com/chunnu-kumar01/Desk2dine)

---

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

## 🎓 Author

**Desk2Dine Team** — Campus Canteen Ordering System

---

> Built with ❤️ for the campus community. Fresh food, fast delivery, zero stress. 🍱
