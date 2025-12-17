# 🔧 Fix03 - Features & Fixes Log

> This file tracks all new features and fixes made to the project.
> Started: 2025-12-16

---

## 📁 How to Identify Frontend vs Backend Changes

### Frontend (`elearning-frontend/`)
| Indicator | Example |
|-----------|---------|
| **Folder** | `elearning-frontend/src/...` |
| **File extensions** | `.tsx`, `.ts`, `.css`, `.js` |
| **Technology** | Next.js, React, TailwindCSS |
| **Port** | `localhost:3300` |
| **Key folders** | `app/`, `components/`, `services/`, `hooks/`, `utils/` |

### Backend (`online-elearning-platform/`)
| Indicator | Example |
|-----------|---------|
| **Folder** | `online-elearning-platform/src/...` |
| **File extensions** | `.ts` (NestJS) |
| **Technology** | NestJS, Prisma, MongoDB |
| **Port** | `localhost:3000` |
| **Key folders** | `routes/`, `prisma/`, `common/`, `config/` |

---

## 📝 Change Log Format

For each fix/feature, document:
```
### [DATE] - Title
- **Type:** Frontend / Backend / Both
- **Files Changed:** list of files
- **Description:** what was changed and why
- **Code Changes:** (for backend, show before/after with comments)
```

---

## 🚀 Changes

<!-- Add new entries below this line -->

### 2025-12-16 - Template Created
- **Type:** Documentation
- **Files Changed:** `Prompt/Fix03.md`
- **Description:** Created this tracking file for future fixes and features

---

### 2025-12-16 - Deployment Configuration (Vercel + Render)
- **Type:** Backend + Documentation
- **Files Changed:** 
  - `online-elearning-platform/src/main.ts`
  - `online-elearning-platform/render.yaml` (new)
  - `Prompt/deployment-guide.md` (new)
- **Description:** Added deployment configuration for Vercel (frontend) and Render (backend)

**Backend Code Changes (`main.ts`):**
```typescript
// BEFORE:
// app.enableCors()

// AFTER (with proper CORS for production):
app.enableCors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3300',
    'http://localhost:3300', // Local development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
})
```

---

<!-- EXAMPLE FORMAT FOR BACKEND FIX:

### 2025-12-XX - Fix Quiz Explanation Not Showing
- **Type:** Backend
- **Files Changed:** `online-elearning-platform/src/routes/quizz/quizz.model.ts`
- **Description:** Added `explanation` field to QuestionSchema so API returns it

**Code Changes:**
```typescript
// BEFORE (line 24-30):
// export const QuestionSchema = z.object({
//   id: z.string(),
//   text: z.string().min(1),
//   options: z.array(z.string()).min(2).max(6),
//   correctAnswerIndex: z.number().int().min(0),
//   quizId: z.string(),
// })

// AFTER (with fix):
export const QuestionSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  options: z.array(z.string()).min(2).max(6),
  correctAnswerIndex: z.number().int().min(0),
  explanation: z.string().nullable().optional(), // ← ADDED: explanation field
  quizId: z.string(),
})
```

-->

