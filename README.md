# 📚 E-Learning Platform

An AI-powered E-Learning Platform built with **Next.js 15**, **NestJS**, **MongoDB**, and **OpenAI**.

---

## 🏗️ Project Structure

```
Elearning-Platform/
├── elearning-frontend/         # Next.js 15 Frontend (React 19)
├── online-elearning-platform/  # NestJS Backend
├── mcp-ai/                     # Cloudflare Worker MCP AI Service
└── BaoCao/                     # Project reports/documents
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **MongoDB** (Atlas or local)

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone <repository-url>
cd Elearning-Platform
```

### 2️⃣ Backend Setup

```bash
# Navigate to backend directory
cd online-elearning-platform

# Install dependencies
npm install

# Generate Prisma client (REQUIRED!)
npx prisma generate

# Start development server (runs on port 3000)
npm run start:dev
```

### 3️⃣ Frontend Setup

```bash
# Navigate to frontend directory
cd elearning-frontend

# Install dependencies
npm install

# Start development server (runs on port 3300)
npm run dev
```

---

## 🌐 Access the Application

| Service   | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost:3300        |
| Backend   | http://localhost:3000        |

---

## 🔑 Test Accounts

### Admin Account
| Field     | Value                |
|-----------|----------------------|
| Email     | `admin@gmail.com`    |
| Password  | `leminhhoang@@`      |
| Role      | Admin                |

> **Note:** The admin account is created automatically when the backend first connects to the database (from the `.env` configuration).

---


## 📋 Available Scripts

### Backend (`online-elearning-platform/`)

| Command                  | Description                           |
|--------------------------|---------------------------------------|
| `npm install`            | Install dependencies                  |
| `npx prisma generate`    | Generate Prisma client                |
| `npm run start:dev`      | Start in development mode (watch)     |
| `npm run start`          | Start in production mode              |
| `npm run build`          | Build for production                  |
| `npm run init-seed-data` | Seed initial data to database         |

### Frontend (`elearning-frontend/`)

| Command          | Description                        |
|------------------|------------------------------------|
| `npm install`    | Install dependencies               |
| `npm run dev`    | Start dev server (port 3300)       |
| `npm run build`  | Build for production               |
| `npm run start`  | Start production server            |
| `npm run lint`   | Run ESLint                         |

---

## 🔄 Full Setup Commands (Copy & Paste)

```bash
# Terminal 1: Backend
cd online-elearning-platform
npm install
npx prisma generate
npm run start:dev

# Terminal 2: Frontend
cd elearning-frontend
npm install
npm run dev
```

---

## 🎯 Features

### For Students
- 📖 Browse and enroll in courses
- 📹 Watch video lessons
- 📝 Take quizzes with instant grading
- 📊 Track learning progress
- 🎓 Earn completion certificates

### For Instructors
- ✏️ Create and manage courses
- 📚 Add chapters and lessons
- 🧠 Create quizzes
- 📈 View student analytics

### For Admins
- 👥 User management
- 🔐 Role & permission management
- 📊 Platform analytics

### AI Features
- 🤖 **AI Course Generator** - Generate complete courses from a topic
- 🧠 **AI Quiz Generator** - Auto-generate quizzes from course content
- 💬 **AI Tutor** - Interactive AI assistant

---

## 📄 Available Pages (27 Total)

### 🔓 Public Pages (No Login Required)

| Page | URL |
|------|-----|
| Home | `/` |
| Courses List | `/course` |
| Course Detail | `/course/[courseId]` |
| Quiz Bank | `/quiz` |
| Quiz Detail | `/quiz/[quizId]` |
| Quiz Attempt | `/quiz/[quizId]/attempt/[attemptId]` |
| Quiz Result | `/quiz/[quizId]/result/[attemptId]` |

### 🔐 Auth Pages

| Page | URL |
|------|-----|
| Sign In | `/sign-in` |
| Sign Up | `/sign-up` |
| Forgot Password | `/forgot-password` |
| Google OAuth Callback | `/oauth-google-callback` |
| GitHub OAuth Callback | `/oauth-github-callback` |

### 📊 Dashboard Pages (Login Required)

| Page | URL |
|------|-----|
| Dashboard Home | `/dashboard` |
| Profile | `/dashboard/profile` |
| Courses Management | `/dashboard/courses` |
| Create Course | `/dashboard/courses/create` |
| Edit Course | `/dashboard/courses/[courseId]/edit` |
| Learning (Student View) | `/dashboard/learning/[enrollmentId]` |
| Quizzes Management | `/dashboard/quizzes` |
| Quiz Detail | `/dashboard/quizzes/[quizId]` |
| Create Quiz | `/dashboard/quizzes/create` |
| Edit Quiz | `/dashboard/quizzes/[quizId]/edit` |
| Users Management | `/dashboard/users` |
| Roles Management | `/dashboard/roles` |

### 🤖 AI Assistant Pages

| Page | URL |
|------|-----|
| AI Assistant Home | `/dashboard/ai-assistant` |
| AI Course Generator | `/dashboard/ai-assistant/course-generator` |
| AI Quiz Generator | `/dashboard/ai-assistant/quiz-generator` |

## 🛠️ Tech Stack

### Frontend
- Next.js 15 (App Router)
- React 19
- TailwindCSS 4
- Radix UI (shadcn/ui)
- React Query
- React Hook Form + Zod

### Backend
- NestJS 11
- Prisma ORM + MongoDB
- JWT Authentication
- LangChain + OpenAI
- AWS S3

---

## 📞 Support

For issues or questions, please create an issue in the repository.

---

## 📄 License

This project is licensed under the MIT License.
