# 🏥 CarePlus Hospital – React & Node.js AI-Powered RAG Assistant

CarePlus Hospital is a modern, full-stack AI-powered hospital FAQ and appointment management application. Originally built with Streamlit and Python, it has been converted into a high-performance **React.js Single Page Application (SPA)** and **Node.js Express REST API**, backed by a verified **Retrieval-Augmented Generation (RAG)** engine and persistent appointment database.

---

## 🚀 Features

- 🤖 **AI Hospital FAQ Chatbot (RAG)**: Answers queries about OPD timings, doctors, hospital fees, and guidelines using Google Gemini with ground-truth document retrieval and source citations.
- 👨‍⚕️ **Doctors & Departments**: Interactive doctor directory with experience badges, department listings, and direct booking shortcuts.
- 📅 **Dynamic Appointment Booking**:
  - Live OPD schedule validation (checks days of week and operating hours).
  - Automated 30-minute time slot generation.
  - Booked slot prevention (prevents double-booking).
  - Validation for 10-digit phone number and past date prevention.
  - Printable/viewable appointment confirmation receipt.
- 📋 **My Appointments**: Search appointments by patient name, doctor, department, or ID, with instant cancellation.
- 🔐 **Admin Portal & Dashboard**:
  - Secure credential authentication (`ADMIN_USERNAME` / `ADMIN_PASSWORD`).
  - Key Performance Indicators (Total, Confirmed, Cancelled).
  - Interactive Analytics Charts (by Department, Doctor, Status, and Date).
  - Multi-criteria filtering (Search, Department, Status, Date Range).
  - Appointment moderation (cancel appointments).
  - One-click CSV export of all appointment records.
- 📚 **Knowledge Base Sources**: Direct inspection of all hospital source documents.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Lucide Icons, Modern CSS Design System |
| **Backend** | Node.js, Express.js, CORS, Dotenv |
| **Database** | Persistent Appointment Store (SQLite compatible) |
| **AI / RAG** | Google Gemini (`@google/generative-ai`), Semantic Chunking & Relevance Scoring |

---

## 📂 Project Structure

```text
Gen-main/
│
├── package.json              # Root project configuration & scripts
├── .env                      # Environment variables (Gemini API key, Admin credentials)
├── .env.example              # Sample environment template
│
├── server/                   # Node.js + Express Backend
│   ├── package.json
│   ├── index.js              # REST API endpoints & route handlers
│   ├── database.js           # Database operations & slot collision prevention
│   └── rag.js                # Document chunking, retrieval & Gemini RAG
│
├── client/                   # React Frontend (Vite)
│   ├── package.json
│   ├── vite.config.js        # Vite config with /api reverse proxy
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx           # Root layout & page router
│       ├── index.css         # Custom responsive hospital theme
│       ├── services/
│       │   └── api.js        # Centralized async API client
│       └── components/
│           ├── Navbar.jsx
│           ├── Sidebar.jsx
│           ├── Home.jsx
│           ├── FaqChat.jsx   # AI RAG Chatbot with source drawer
│           ├── Doctors.jsx
│           ├── Booking.jsx   # Slot booking & confirmation
│           ├── MyAppointments.jsx
│           ├── AdminLogin.jsx
│           ├── AdminDashboard.jsx
│           └── Sources.jsx
│
└── documents/                # Hospital knowledge base
    ├── appointment_rules.txt
    ├── departments.txt
    ├── doctors.txt
    ├── fees.txt
    ├── hospital_information.txt
    └── opd_timings.txt
```

---

## ⚙️ Installation and Setup

### 1. Prerequisites
- **Node.js** v18+ (tested with v22+)
- **npm** v9+

### 2. Install Dependencies

Install dependencies for both backend and frontend:

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Configure Environment Variables

Create or edit the `.env` file in the root directory:

```env
# Optional: Google Gemini API key for AI RAG Chatbot
GEMINI_API_KEY=your_gemini_api_key_here

# Backend Port
PORT=5000

# Admin Portal Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

*(Note: If no Gemini API key is provided, the chatbot uses local semantic document retrieval so the application remains fully functional!)*

---

## 🚀 Running the Application

### Option A: Development Mode (Recommended)

Run the backend and frontend in separate terminals:

**Terminal 1 (Backend Server on port 5000):**
```bash
npm run server
```

**Terminal 2 (Frontend React App on port 3000):**
```bash
npm run client
```

Now open your browser at **[http://localhost:3000](http://localhost:3000)**.

---

### Option B: Production Build

```bash
# 1. Build the React client
npm run build

# 2. Start the unified Node.js server
npm run server
```

The Express server will automatically serve the built React frontend at **[http://localhost:5000](http://localhost:5000)**.

---

## 🔐 Default Admin Credentials

- **Username:** `admin`
- **Password:** `admin123`

---

## 📑 API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/doctors` | List doctors, departments, and doctor mapping |
| `GET` | `/api/slots` | Get OPD status and available 30-min slots |
| `POST` | `/api/appointments` | Book appointment with validation |
| `GET` | `/api/appointments` | Get appointments with search filter |
| `PATCH` | `/api/appointments/:id/cancel` | Cancel an appointment |
| `POST` | `/api/admin/login` | Admin authentication |
| `GET` | `/api/admin/dashboard` | Admin analytics, KPI metrics, filtered list |
| `GET` | `/api/admin/export-csv` | Download appointment records as CSV |
| `POST` | `/api/chat` | AI RAG Chatbot question answering |
| `GET` | `/api/sources` | Knowledge base source documents |
