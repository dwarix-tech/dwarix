# DWARIX Technologies – Full-Stack MERN Platform

Enterprise-grade full-stack web and mobile systems engineering platform. Built with a modern **MERN** stack architecture (MongoDB, Express.js, React 18, Node.js), GSAP smooth scrolling & transitions, Lenis, and an interactive Admin Management Portal.

---

## 1. Architecture Overview

```
dwarix/
├── client/                     # React 18 + Vite Frontend Application
│   ├── public/                 # Favicon, robots.txt, sitemap.xml, assets
│   ├── src/
│   │   ├── components/         # Reusable UI & Admin layout components
│   │   ├── context/            # AuthContext (JWT session state & hooks)
│   │   ├── data/               # Services, Projects, Technologies schemas
│   │   ├── pages/              # PublicHome & Admin views (Dashboard, Enquiries, Projects, etc.)
│   │   ├── sections/           # Hero, About, Services, WhyChooseUs, Process, Technologies, Portfolio, Contact
│   │   ├── services/           # API integration layer with fallback
│   │   └── styles/             # Variables, global, components, responsive, admin CSS
│   ├── package.json
│   └── vite.config.js          # Vite config with API proxy to Node backend
│
├── server/                     # Node.js + Express.js + MongoDB API Backend
│   ├── src/
│   │   ├── config/             # DB connection & environment management
│   │   ├── controllers/        # Auth, Public, Enquiry, and Admin controllers
│   │   ├── middleware/         # JWT auth, RBAC, Rate limiting, Validation, Error handler
│   │   ├── models/             # Mongoose schemas: Admin, Enquiry, Project, Service, Technology, Company
│   │   ├── routes/             # REST endpoints (/api/auth, /api/enquiries, /api/admin, /api/*)
│   │   ├── scripts/            # Database seed script
│   │   ├── services/           # Nodemailer email notification & Cloudinary image upload
│   │   ├── app.js              # Express app with Helmet, CORS, parsers, and routing
│   │   └── server.js           # Server bootstrap and graceful shutdown
│   ├── tests/                  # Integration test suite with in-memory MongoDB
│   └── package.json
│
├── package.json                # Root workspace configuration
└── README.md
```

---

## 2. Key Features

### Public Frontend
- **Design & Identity Preservation**: Retains the complete dark charcoal (`#0D0F12`) and copper/orange (`#E06B2D`) brand scheme, typography (`Unbounded` & `Instrument Sans`), and motion design.
- **Lenis Smooth Scroll & GSAP ScrollTrigger**: Physics-based inertial scrolling integrated with GSAP timeline triggers.
- **Interactive Service Visuals**: Custom simulations for AI workflows, responsive layouts, device viewports, and interactive photo retouching before/after sliders.
- **Controlled Contact Form**: Real-time validation, honeypot bot trap, ARIA accessibility, and seamless integration with the Express enquiry API.
- **Rule-based AI Chatbot**: Contextual suggestions, deep section navigation, and service pre-selection.

### Express & MongoDB Backend
- **RESTful API**: Standardized JSON response formatting (`success`, `data`, `message`, `errors`).
- **Security First**: `helmet` security headers, CORS origin whitelisting, `express-rate-limit` for endpoints, and `express-validator` schema enforcement.
- **JWT Authentication via HTTP-Only Cookies**: Protected sessions using secure, `httpOnly`, `sameSite` cookie tokens to prevent XSS credential theft.
- **Mongoose Data Modeling**: Strict typing, pre-save bcrypt password hashing, slug generation, and query indexing.
- **Automated Email Notifications**: Dual-notification system using Nodemailer sending administrative alerts and client confirmations.
- **Asset Upload Pipeline**: Multer buffer processing connected to Cloudinary CDN with fallback.

### Admin Dashboard (`/admin`)
- **Dashboard Overview**: Real-time enquiry counts, status breakdown (`New`, `Contacted`, `In Progress`, `Completed`, `Rejected`), and recent activity.
- **Enquiry Manager**: Search, filter by lifecycle status, view project briefs, update status, append internal notes, and delete records.
- **Project Manager**: Add, edit, feature, and manage portfolio case studies and sample concepts.
- **Service Manager**: Edit service titles, descriptions, deliverables, and mapped tech stacks.
- **Technology Manager**: Manage technology badges and color codes across categories.
- **Company Settings**: Update contact information, address, social channels, and SEO metadata.

---

## 3. Quick Start & Local Setup

### Prerequisites
- Node.js >= 18.x
- MongoDB (Local instance or MongoDB Atlas connection URI)

### Installation
From the repository root:
```bash
# Install dependencies for all workspaces
npm install
```

### Environment Configuration
1. Configure `server/.env`:
```bash
cp server/.env.example server/.env
```
Update `MONGO_URI`, `JWT_SECRET`, and optional `SMTP_*` or `CLOUDINARY_*` values.

2. Configure `client/.env` (optional, defaults to relative `/api`):
```bash
cp client/.env.example client/.env
```

### Database Seeding
Initialize the database with the initial superadmin account, core services, technologies, sample projects, and company information:
```bash
npm run seed
```
Default credentials generated by seed:
- **Email**: `admin@dwarix.com`
- **Password**: `Admin@Dwarix2026!`

### Running the Application

**Run Backend Server:**
```bash
npm run dev:server
# Server starts on http://localhost:5000
```

**Run Frontend Client:**
```bash
npm run dev:client
# Client starts on http://localhost:5173
```

---

## 4. Testing & Verification

Run the comprehensive server integration test suite (includes in-memory MongoDB):
```bash
npm test
```
The automated test verifies:
- Health check `GET /api/health`
- Public endpoints (`/api/company`, `/api/services`, `/api/projects`, `/api/technologies`)
- Enquiry submission, express-validator schema checks, and honeypot spam detection
- Real MongoDB database persistence
- JWT authentication, rejection of unauthorized requests, and cookie clearing
- Admin statistics, enquiry status updates, note appending, and project CRUD operations

Build the production client bundle:
```bash
npm run build
```

