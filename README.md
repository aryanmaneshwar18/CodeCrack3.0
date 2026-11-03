# CampusCare

CampusCare is a full-stack campus complaint management system. Students can report Wi-Fi, hostel, classroom, and laboratory issues; campus administrators can search, triage, and track them through resolution in one dashboard.

## Features

- Responsive dashboard with live totals, category and status charts, recent reports, and urgency queue.
- Complaint submission with validation and generated IDs (`C01`, `C02`, …).
- Combined text search and category/status filters.
- Controlled lifecycle: Raised → In Progress → Resolved.
- Top-three unresolved queue using a dynamic age-based score and deterministic tie breaks.
- MongoDB persistence, seed data, API health check, and clear API errors.

## Technology and architecture

React 18, Vite, React Router, Axios, Recharts, Lucide React; Node.js, Express, Mongoose; MongoDB. The frontend calls the REST API; the API validates requests and reads/writes MongoDB. No browser storage is used as a database.

```text
frontend/src/       React application and API client
backend/models/     Mongoose schemas
backend/controllers/ API logic, analytics, and urgency ranking
backend/routes/     REST route maps
backend/scripts/    Idempotent sample data seeder
```

### Complaint record

`complaintId` (unique string), `category` (Wi-Fi, Hostel, Classroom, Laboratory), `description`, `status` (Raised, In Progress, Resolved), `submittedAt`, `createdAt`, and `updatedAt`. MongoDB indexes support ID uniqueness, category/status filtering, and submitted-time ordering. A MongoDB atomic counter allocates sequential IDs safely under concurrent submissions.

## Urgency algorithm

For each unresolved complaint:

```text
urgency = category weight + floor(max(0, now - submittedAt) / 24 hours)
Wi-Fi = 2, Hostel = 2, Classroom = 1, Laboratory = 3
```

Only Raised and In Progress records are eligible. Sort by score descending, then submitted time ascending (oldest first), then complaint ID ascending. Return at most three. Scores use the stored `submittedAt` and are recalculated when requested. Resolved complaints never appear in the queue.

## API

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/complaints` | Create `{ category, description }` |
| GET | `/api/complaints` | List; optional `search`, `category`, `status` query parameters |
| GET | `/api/complaints/:id` | Fetch by complaint ID, e.g. `C01` |
| PATCH | `/api/complaints/:id/status` | Advance using `{ "status": "In Progress" }` or `{ "status": "Resolved" }` |
| GET | `/api/analytics/summary` | Totals, category distribution, status distribution |
| GET | `/api/analytics/priority` | Top three unresolved records with `urgencyScore` |
| GET | `/api/health` | API and database connection state |

Responses use `{ "data": ... }`; validation errors return an `{ "error": ... }` message. Invalid lifecycle transitions and missing IDs return 400 and 404 respectively.

## Run locally

Requirements: Node.js 18+ and MongoDB (local or Atlas).

1. Copy `backend/.env.example` to `backend/.env`, set `MONGODB_URI`, and optionally configure `PORT` and `CLIENT_ORIGIN`.
2. Copy `frontend/.env.example` to `frontend/.env` if the API is not at `http://localhost:5000/api`.
3. Install dependencies from the repository root:

   ```sh
   npm run install:all
   ```

4. Start MongoDB. In separate terminals run:

   ```sh
   npm run dev:backend
   npm run dev:frontend
   ```

5. Open the Vite URL (usually `http://localhost:5173`). Check API/database status at `http://localhost:5000/api/health`.

Seed the sample records (safe to rerun; existing IDs are preserved):

```sh
npm --prefix backend run seed
```

Samples: C01 Wi-Fi (48 hours old, Raised), C02 Hostel (8 hours old, In Progress), C03 Classroom (72 hours old, Raised), C04 Laboratory (24 hours old, Resolved). The resolved sample is excluded from priority.

## Screenshots

Add dashboard and mobile screenshots here after launching the app.

## Future improvements

Authentication and role-based access, notifications, attachments, comments, campus-specific SLA policies, and audit history.
