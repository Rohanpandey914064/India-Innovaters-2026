# ⚡ CitySpark — The Digital Twin for Your Smarter City

<div align="center">

![CitySpark Banner](https://img.shields.io/badge/CitySpark-Public%20Beta-6366f1?style=for-the-badge&logo=lightning&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)

**Report civic issues, navigate government services with AI, and build a better community together through predictive maintenance and transparent data.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Project Structure](#-project-structure) • [API Docs](#-api-reference) • [Environment Variables](#-environment-variables)

</div>

---

## 🌆 What is CitySpark?

CitySpark is a full-stack civic-tech platform that acts as a **digital twin for city management**. It empowers citizens to:

- 📍 **Report** potholes, broken streetlights, water leaks, and more
- 🗳️ **Upvote / downvote** issues to surface the most urgent problems
- 🗺️ **View** all reported issues on an interactive live map
- 🤖 **Chat** with an AI Civic Assistant for guidance on government schemes & documents
- 📊 **Track** resolution progress through a transparent dashboard
- 🌐 **Switch** the entire UI to 9 Indian regional languages in real time

City officials get a powerful **Admin Dashboard** with:
- Priority scoring & automatic department assignment
- Predictive analytics on issue recurrence
- Appeal & dispute resolution workflow
- Escalation management

---

## ✨ Features

### 👥 For Citizens
| Feature | Description |
|---|---|
| **Issue Reporting** | Submit civic issues with title, description, category, geo-tagged location, and photo |
| **Live Map View** | Browse all city issues on a Leaflet-powered interactive map |
| **Community Feed** | Upvote/downvote issues, leave comments, and follow progress |
| **AI Civic Assistant** | Chat-based assistant (powered by Gemini AI) for PAN, Aadhaar, ration card, and scheme guidance |
| **Government Schemes** | Browse and apply for welfare schemes and municipal services |
| **Document OCR** | Upload government documents — Tesseract.js reads them automatically |
| **Multi-language UI** | Full app translation into Hindi, Bengali, Telugu, Marathi, Tamil, Gujarati, Kannada, Malayalam, Punjabi |
| **Dark / Light Mode** | System-aware theme toggle with persistent preference |

### 🏛️ For Administrators
| Feature | Description |
|---|---|
| **Admin Dashboard** | Full overview of all reported issues with filtering and analytics |
| **Priority Scoring** | AI-driven priority labels (Low / Medium / High / Critical) |
| **Department Assignment** | Assign issues to the correct municipal department |
| **Verification Workflow** | Verify or reject issue reports with notes |
| **Escalation Tracking** | Track SLA breaches and escalate overdue issues |
| **Appeal Management** | Citizens can appeal closed issues; admins review and override |
| **Predictive Maintenance** | Identifies repeat-location issues and predicts recurrence |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 19 | Core UI framework |
| **Vite** | 8 | Lightning-fast dev server and bundler |
| **React Router DOM** | 7 | Client-side routing and protected routes |
| **Tailwind CSS** | 4 | Utility-first styling |
| **Framer Motion** | 12 | Smooth animations and page transitions |
| **React Leaflet + Leaflet** | 5 / 1.9 | Interactive map for issue geo-location |
| **Lucide React** | latest | Icon library |
| **Radix UI** | latest | Accessible headless UI components (Accordion, Dialog, Dropdown, Label) |
| **Tesseract.js** | 7 | In-browser OCR for government document reading |
| **pdfjs-dist** | 5 | PDF rendering and text extraction in browser |
| **clsx + tailwind-merge** | latest | Conditional class merging utilities |
| **@supabase/supabase-js** | 2 | Database client (auth/storage integration) |
| **Firebase** | 12 | Additional auth and storage capabilities |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js + Express** | 4 | REST API server |
| **MongoDB + Mongoose** | 8 | Database and ODM |
| **JSON Web Tokens (JWT)** | 9 | Stateless authentication |
| **bcryptjs** | 2 | Password hashing |
| **cors** | 2 | Cross-origin request handling |
| **express-rate-limit** | 8 | API rate limiting |
| **dotenv** | 16 | Environment variable management |

### AI & External APIs
| Service | Purpose |
|---|---|
| **Google Gemini AI** (`gemini-2.0-flash-lite`, `gemini-1.5-flash`) | AI Civic Assistant chatbot + fallback translation |
| **Sarvam AI** | Primary Indian-language translation (9 regional languages) |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18 or later
- [MongoDB](https://www.mongodb.com/try/download/community) running locally **or** a MongoDB Atlas URI
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/cityspark.git
cd cityspark
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
npm install --prefix server
```

### 4. Configure Environment Variables

**Frontend** — create `.env.local` in the project root:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_SARVAM_API_KEY=your_sarvam_api_key_here
```

**Backend** — create `server/.env` (copy from example):

```bash
cp server/.env.example server/.env
```

Then edit `server/.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/cityspark
PORT=5000
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Generate a secure JWT secret:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 5. (Optional) Seed the Database

To populate the database with sample civic issues:

```bash
node server/seed.js
```

### 6. Run the Application

Open **two separate terminals**:

**Terminal 1 — Start the Backend Server:**
```bash
npm run server
```
> API will be available at `http://localhost:5000`

**Terminal 2 — Start the Frontend:**
```bash
npm run dev
```
> App will be available at `http://localhost:5173`

---

## 📁 Project Structure

```
cityspark/
├── public/                     # Static assets
├── src/                        # Frontend source
│   ├── components/
│   │   ├── layout/             # AppLayout, Navbar, Sidebar
│   │   └── ui/                 # Reusable UI components
│   ├── context/
│   │   ├── AppContext.jsx       # Global app state (issues, votes, comments)
│   │   ├── AuthContext.jsx      # Authentication state
│   │   ├── LanguageContext.jsx  # i18n / translation engine
│   │   ├── ThemeContext.jsx     # Dark/light mode
│   │   └── translations.js     # All UI string translations
│   ├── pages/
│   │   ├── Landing.jsx          # Public landing page
│   │   ├── Auth.jsx             # Login & Sign Up
│   │   ├── Home.jsx             # Citizen home dashboard
│   │   ├── Feed.jsx             # Community issue feed
│   │   ├── MapView.jsx          # Interactive Leaflet map
│   │   ├── ReportIssue.jsx      # Issue submission form
│   │   ├── Dashboard.jsx        # Admin control panel
│   │   ├── AICivicAssistant.jsx # AI chatbot page
│   │   ├── Services.jsx         # Government schemes browser
│   │   └── Profile.jsx          # User profile & history
│   ├── services/
│   │   ├── GeminiService.js     # Gemini AI translation (fallback)
│   │   ├── SarvamService.js     # Sarvam AI translation (primary)
│   │   ├── CivicEngine.js       # Civic data processing logic
│   │   ├── DuplicateService.js  # Duplicate issue detection
│   │   └── PredictiveService.js # Predictive maintenance analytics
│   ├── App.jsx                  # Root component & router
│   └── main.jsx                 # React DOM entry point
│
├── server/                     # Backend source
│   ├── models/
│   │   ├── Issue.js             # Issue schema (with appeals, escalation)
│   │   ├── User.js              # User schema
│   │   ├── Notification.js      # Notification schema
│   │   ├── OTP.js               # OTP verification schema
│   │   ├── Scheme.js            # Government scheme schema
│   │   └── VerificationLog.js   # Audit trail schema
│   ├── routes/
│   │   ├── issues.js            # CRUD + voting + appeals
│   │   ├── auth.js              # Register, login, OTP, JWT
│   │   ├── dashboard.js         # Admin analytics endpoints
│   │   ├── notifications.js     # User notification system
│   │   └── ai.js                # AI assistant proxy
│   ├── middleware/              # Auth middleware (JWT verification)
│   ├── services/                # Server-side business logic
│   ├── db.js                    # MongoDB connection
│   ├── index.js                 # Express app & server bootstrap
│   └── seed.js                  # Database seeder
│
├── .env.local                  # Frontend env vars (not committed)
├── server/.env                 # Backend env vars (not committed)
├── vite.config.js              # Vite config with /api proxy
├── tailwind.config.js          # Tailwind theme config
└── package.json                # Root scripts
```

---

## 🌐 Pages & Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/login` | Public | Sign in |
| `/signup` | Public | Create account |
| `/home` | 🔒 Auth | Citizen home |
| `/feed` | 🔒 Auth | Community issue feed |
| `/map` | 🔒 Auth | Interactive map view |
| `/report` | 🔒 Auth | Report a new issue |
| `/services` | 🔒 Auth | Government schemes |
| `/assistant` | 🔒 Auth | AI Civic chatbot |
| `/dashboard` | 🔒 Auth | Admin control panel |
| `/profile` | 🔒 Auth | User profile |
| `/about` | Public | About CitySpark |
| `/blog` | Public | Blog |
| `/pricing` | Public | Pricing |
| `/docs` | Public | Documentation |
| `/help` | Public | Help Center |
| `/privacy` | Public | Privacy Policy |
| `/terms` | Public | Terms of Service |

---

## 📡 API Reference

All API routes are prefixed with `/api`.

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Create a new user account |
| `POST` | `/login` | Authenticate and receive JWT |
| `POST` | `/otp/send` | Send OTP for verification |
| `POST` | `/otp/verify` | Verify OTP |

### Issues (`/api/issues`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Get all issues |
| `POST` | `/` | Create a new issue |
| `GET` | `/:id` | Get a single issue |
| `PUT` | `/:id` | Update issue (admin) |
| `DELETE` | `/:id` | Delete issue (admin) |
| `POST` | `/:id/vote` | Upvote or downvote |
| `POST` | `/:id/comment` | Add a comment |
| `POST` | `/:id/appeal` | Submit a resolution appeal |
| `PUT` | `/:id/verify` | Admin: verify/reject issue |
| `PUT` | `/:id/assign` | Admin: assign to department |

### Dashboard (`/api/dashboard`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/stats` | City-wide analytics |
| `GET` | `/escalations` | Issues breaching SLA |

### AI (`/api/ai`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/chat` | Send message to AI assistant |

### Notifications (`/api/notifications`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Get user notifications |
| `PUT` | `/:id/read` | Mark notification as read |

---

## 🔐 Environment Variables

### Frontend (`.env.local`)

| Variable | Required | Description |
|---|---|---|
| `VITE_GEMINI_API_KEY` | Optional | Google Gemini AI key for translation fallback and AI assistant |
| `VITE_SARVAM_API_KEY` | Optional | Sarvam AI key for primary Indian-language translation |

> Without these keys, the app runs in English-only mode and the AI assistant uses pre-defined responses.

### Backend (`server/.env`)

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ Yes | MongoDB connection string |
| `PORT` | No | Server port (default: `5000`) |
| `JWT_SECRET` | ✅ Yes | Secret key for signing JWTs (use a long random string in production) |
| `JWT_EXPIRES_IN` | No | JWT expiry duration (default: `7d`) |
| `NODE_ENV` | No | `development` or `production` |
| `GEMINI_API_KEY` | Optional | Gemini key for server-side AI responses |

---

## 🌍 Multi-language Support

CitySpark supports **9 Indian regional languages** using a two-tier translation system:

1. **Sarvam AI** (primary) — Purpose-built NMT model for Indian languages
2. **Google Gemini AI** (fallback) — High-quality fallback when Sarvam is unavailable

Supported languages:

| Language | Code | Script |
|---|---|---|
| Hindi | `hi` | Devanagari |
| Bengali | `bn` | Bengali |
| Telugu | `te` | Telugu |
| Marathi | `mr` | Devanagari |
| Tamil | `ta` | Tamil |
| Gujarati | `gu` | Gujarati |
| Kannada | `kn` | Kannada |
| Malayalam | `ml` | Malayalam |
| Punjabi | `pa` | Gurmukhi |

---

## 🧠 AI Features

### AI Civic Assistant
- Built on **Google Gemini** (`gemini-2.0-flash-lite` with fallback to `gemini-1.5-flash`)
- Helps citizens with queries about PAN card, Aadhaar, ration card, pension, MGNREGA, PM Awas Yojana, and more
- Responds in the user's selected language

### Predictive Maintenance (`PredictiveService.js`)
- Detects **repeat issues** at the same location
- Predicts likelihood of recurrence based on historical patterns
- Feeds into the admin dashboard's escalation workflow

### Duplicate Detection (`DuplicateService.js`)
- Identifies and flags duplicate issue reports before they are submitted
- Reduces noise in the city's issue queue

---

## 📦 Available Scripts

From the **project root**:

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite frontend dev server |
| `npm run server` | Start the Express backend in watch mode |
| `npm run build` | Build the frontend for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint on the codebase |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** your feature branch: `git checkout -b feature/my-feature`
3. **Commit** your changes: `git commit -m 'feat: add my feature'`
4. **Push** to the branch: `git push origin feature/my-feature`
5. **Open** a Pull Request

### Commit Convention
This project follows [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `chore:` — build/tooling changes
- `refactor:` — code restructuring

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

Built with ❤️ for **India Innovators 2026**.

---

<div align="center">
  <sub>⚡ CitySpark — Powering Smarter Cities, One Issue at a Time</sub>
</div>
