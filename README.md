# KinderConnect

> Full-stack kindergarten parent-teacher communication platform.

## Project Structure

```
kinderconnect/
├── frontend/                          # Next.js 14 App Router + TypeScript + Tailwind
│   ├── app/
│   │   ├── layout.tsx                 # Root layout with AppProvider
│   │   ├── page.tsx                   # Entry: Login or AuthenticatedLayout
│   │   ├── globals.css
│   │   └── api/                       # Next.js API routes (BFF layer)
│   │       ├── announcements/route.ts
│   │       ├── activities/route.ts
│   │       ├── attendance/route.ts
│   │       └── messages/route.ts
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   └── index.tsx              # Button, Card, Badge primitives
│   │   └── feature/
│   │       ├── LoginScreen.tsx
│   │       ├── Sidebar.tsx
│   │       ├── AuthenticatedLayout.tsx
│   │       ├── TeacherDashboard.tsx
│   │       ├── ParentDashboard.tsx
│   │       ├── AttendanceView.tsx
│   │       ├── AnnouncementsView.tsx
│   │       ├── MessagingSystem.tsx
│   │       └── ActivitiesView.tsx
│   │
│   ├── modules/
│   │   └── shared/
│   │       ├── types/index.ts         # All TypeScript interfaces & types
│   │       ├── data/mockData.ts       # Seed data
│   │       └── context/AppContext.tsx # Global state via React Context
│   │
│   ├── lib/
│   │   ├── api-client.ts              # Typed API class wrappers
│   │   └── utils.ts                  # Helper utilities
│   │
│   └── tailwind.config.ts
│
├── backend/                           # Standalone Express API (TypeScript, OOP)
│   └── src/
│       ├── interfaces/index.ts        # Shared interfaces matching frontend types
│       ├── models/mockData.ts         # In-memory data store (swap with DB)
│       ├── services/index.ts          # Business logic classes
│       ├── controllers/index.ts       # HTTP request/response handlers
│       └── server.ts                  # Express app entry point
│
└── package.json                       # Monorepo root with concurrently scripts
```

## Getting Started

### Install dependencies
```bash
npm install           # root
cd frontend && npm install
cd ../backend && npm install
```

### Run both servers (from root)
```bash
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api

### Run separately
```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend
```

## Architecture Notes

### State Management
The app uses **React Context** (`AppContext`) for all global state. This is intentional — the original snippet used component-level `useState` with prop drilling. Context preserves that simplicity while enabling scalability.

### API Design
- **Next.js API routes** (`/api/*`) act as a BFF (Backend For Frontend) layer — they use the same service classes as the standalone Express backend.
- **Standalone Express backend** (`backend/`) is ready for microservice deployment or when you need a separate API server.
- The `AnnouncementService`, `ActivityService`, etc. are shared service classes used by both.

### OOP Classes
| Class | Location | Responsibility |
|---|---|---|
| `UserService` | `backend/src/services` | User lookup |
| `AnnouncementService` | `backend/src/services` | CRUD for announcements |
| `ActivityService` | `backend/src/services` | CRUD for activities |
| `AttendanceService` | `backend/src/services` | Attendance tracking |
| `MessageService` | `backend/src/services` | Messaging threads |
| `UserController` | `backend/src/controllers` | HTTP handlers for users |
| `AnnouncementController` | `backend/src/controllers` | HTTP handlers for announcements |
| `AnnouncementApi` | `frontend/lib/api-client` | Frontend fetch wrapper |
| `ActivityApi` | `frontend/lib/api-client` | Frontend fetch wrapper |
| `AttendanceApi` | `frontend/lib/api-client` | Frontend fetch wrapper |
| `MessageApi` | `frontend/lib/api-client` | Frontend fetch wrapper |

### Production Next Steps
- Replace in-memory stores with a real database (Prisma + PostgreSQL recommended)
- Add authentication (NextAuth.js or Clerk)
- Add input validation (Zod)
- Add error boundaries in React
