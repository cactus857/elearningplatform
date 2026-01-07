# 📚 E-Learning Platform

An AI-powered E-Learning Platform built with **Next.js 15**, **NestJS 11**, **MongoDB**, **Redis**, **Elasticsearch**, and **OpenAI**.

---

## 🏗️ Project Structure

```
Elearning-Platform/
├── elearning-frontend/         # Next.js 15 Frontend (React 19)
├── online-elearning-platform/  # NestJS 11 Backend
└── BaoCao/                     # Project reports/documents
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **MongoDB** (Atlas or local)
- **Redis** (Cloud or local)
- **Elasticsearch** (Cloud recommended)

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
| `npm run start:prod`     | Run production build                  |
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
"cd elearning-frontend
npm install
npm run dev"
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
- 🤖 **AI Course Generator** - Generate complete courses from a topic using LangChain
- 🧠 **AI Quiz Generator** - Auto-generate quizzes from course content

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15 | React framework with App Router |
| React | 19 | UI library |
| TailwindCSS | 4 | Utility-first CSS |
| Radix UI | - | Accessible component primitives (shadcn/ui) |
| React Query | 5 | Server state management |
| React Hook Form | 7 | Form handling |
| Zod | 4 | Schema validation |
| Framer Motion | 12 | Animations |
| Axios | 1.12 | HTTP client |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| NestJS | 11 | Node.js framework |
| Prisma | 6 | ORM for MongoDB |
| MongoDB | - | Primary database |
| Redis | - | Caching & session management |
| Elasticsearch | 9 | Full-text search |
| BullMQ | 5 | Background job processing |
| JWT | - | Authentication |
| LangChain | 1.0 | AI orchestration |
| OpenAI | - | GPT models for AI features |
| AWS S3 | - | File storage |
| Resend | - | Email service |

---

## 🗄️ Database Architecture

### MongoDB (Primary Database)
The application uses MongoDB with Prisma ORM. Key collections:

| Collection | Description |
|------------|-------------|
| `User` | User accounts with roles and 2FA |
| `Role` | Role definitions with permissions |
| `Permission` | API endpoint permissions (path + method) |
| `Course` | Course metadata and settings |
| `Chapter` | Course chapters (ordered) |
| `Lesson` | Video/document/text lessons |
| `Enrollment` | Student-course relationships |
| `Quiz` | Quiz configurations |
| `Question` | Quiz questions with options |
| `StudentQuizAttempt` | Quiz attempt records |
| `LessonProgress` | Lesson completion tracking |
| `Device` | User device sessions |
| `RefreshToken` | JWT refresh tokens |

---

## 🔴 Redis Configuration

Redis is used for:
- **Caching** - Course lists, course details, user sessions
- **Rate limiting** - API request throttling
- **Session management** - Refresh token storage
- **Background jobs** - BullMQ queue backend

### Redis Environment Variables

```env
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_USERNAME=default
REDIS_PASSWORD=your-redis-password
```

---

## 🔍 Elasticsearch Configuration

Elasticsearch powers the full-text search functionality:
- **Course search** - Search by title, description, category
- **Real-time indexing** - Courses indexed via BullMQ jobs
- **Cloud-hosted** - Uses Elastic Cloud for reliability

### Elasticsearch Environment Variables

```env
ELASTICSEARCH_CLOUD_ID=your-cloud-id
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your-password
ELASTICSEARCH_INDEX_COURSES=courses
```

### Index Operations
| Job | Description |
|-----|-------------|
| `INDEX_COURSE` | Index new course |
| `UPDATE_COURSE` | Update course in index |
| `DELETE_COURSE` | Remove course from index |

### Search Features
- Fuzzy matching for typo tolerance
- Field boosting (title > description)
- Category filtering
- Level filtering

---

## 🔐 Authentication & Security

### Authentication Flow
1. User logs in with email/password or OAuth (Google/GitHub)
2. Server returns `accessToken` + `refreshToken` 
3. Access token attached to all API requests
4. Auto-refresh on 401 errors via Axios interceptor

### Two-Factor Authentication (2FA)
- TOTP-based (Google Authenticator compatible)
- Setup via QR code
- Required for sensitive operations

### Role-Based Access Control (RBAC)
| Role | Permissions |
|------|-------------|
| Admin | Full access to all resources |
| Instructor | Manage own courses, view enrolled students |
| Student | Browse courses, enroll, take quizzes |

---

## 📁 API Structure

### Auth Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | User registration |
| POST | `/auth/otp` | Send OTP verification code |
| POST | `/auth/login` | User login |
| GET | `/auth/me` | Get current user profile |
| POST | `/auth/refresh-token` | Refresh access token |
| POST | `/auth/logout` | User logout |
| POST | `/auth/forgot-password` | Request password reset |
| GET | `/auth/google-link` | Get Google OAuth URL |
| GET | `/auth/google/callback` | Google OAuth callback |
| GET | `/auth/github-link` | Get GitHub OAuth URL |
| GET | `/auth/github/callback` | GitHub OAuth callback |
| POST | `/auth/2fa/setup` | Setup 2FA |
| POST | `/auth/2fa/enable` | Enable 2FA |
| POST | `/auth/2fa/disable` | Disable 2FA |

### Resource Endpoints
| Resource | Base Path | Operations |
|----------|-----------|------------|
| Users | `/users` | CRUD |
| Roles | `/roles` | CRUD |
| Permissions | `/permissions` | CRUD |
| Courses | `/courses` | CRUD + `/manage` + `/slug/:slug` |
| Chapters | `/chapters` | CRUD + `/reorder` |
| Lessons | `/lessons` | CRUD + `/reorder` |
| Enrollments | `/enrollments` | CRUD + `/enroll` + `/my-courses` |
| Quizzes | `/quizzes` | CRUD + `/start` + `/submit` |
| AI Courses | `/ai/courses` | `/generate` + `/save` |
| AI Quizzes | `/ai/quizzes` | `/generate-from-course` + `/save` |
| Dashboard | `/dashboard/admin` | Analytics data |
| Media | `/media` | File upload |
| Profile | `/profile` | Get/Update profile |

---

## 🚢 Deployment

### Backend (Render)
The backend is configured for Render deployment with:
- `render.yaml` - Render blueprint
- `Procfile` - Process definition

### Frontend (Vercel)
The frontend is optimized for Vercel deployment:
- Automatic builds on push
- Edge functions support
- Image optimization

---

## 📞 Support

For issues or questions, please create an issue in the repository.

---

## 📄 License

This project is licensed under the MIT License.
