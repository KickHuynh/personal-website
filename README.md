# Personal Website Portfolio + CMS

Portfolio ca nhan cua Huynh Ngoc Tai duoc to chuc nhu mot san pham nho thay vi chi la landing page tinh.
Project hien co 3 lop chinh:

- Public portfolio site voi featured projects va project detail page
- Admin CMS de quan ly case study, skills, inbox va analytics snapshot
- Backend Node/Express + MySQL phuc vu CRUD, auth, upload, analytics va contact workflow

## Architecture

### Frontend
- `index.html`: public portfolio homepage
- `project.html`: case study detail page theo slug
- `admin.html`: CMS dashboard
- `scripts/`: frontend modules, API client, analytics tracking, admin logic
- `styles/`: public styles + admin styles

### Backend
- `backend/server.js`: API entrypoint
- `backend/src/app.js`: Express app, middleware, routes, uploads static serving
- `backend/src/routes/*`: projects, skills, messages, auth, analytics, uploads
- `backend/src/models/*`: MySQL access layer
- `backend/src/controllers/*`: request handling
- `backend/src/utils/*`: shared helpers for project fields, uploads, HTTP errors

### Data model highlights
- `projects`: rich case-study content, slug, featured, draft/published, gallery, learnings
- `messages`: inbox items with read/unread workflow
- `analytics_events`: page views, project views, project clicks, contact submits
- `users`: admin login accounts

## Features

### Public portfolio
- Dynamic projects and skills loaded from API
- Static JSON fallback for content resilience in dev/demo mode
- Project detail page by slug
- Basic analytics tracking for page view and project interest
- Contact form posting to backend API

### Admin CMS
- JWT login for admin users
- Create, edit, delete case studies and skills
- Draft/publish toggle and featured toggle for projects
- Inline preview for homepage card and project detail content
- Base64 image upload endpoint for project hero images
- Inbox with read/unread state and delete action
- Analytics snapshot: totals, top project views, recent events

## Local setup

### 1. Install dependencies
```bash
npm ci
npm --prefix backend ci
```

### 2. Configure backend env
Copy `backend/.env.example` to `backend/.env` and fill in:

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`
- `ALLOWED_ORIGINS`
- `ADMIN_FULL_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

### 3. Prepare database
For a fresh database:
```sql
SOURCE backend/schema.sql;
```

For an existing database that already had the old project structure:
```sql
SOURCE backend/migrations/2026-04-14-project-case-study-upgrade.sql;
```

### 4. Seed admin user
```bash
npm --prefix backend run create:admin
```

### 5. Configure frontend runtime API base
Edit `app.config.js`:
```js
window.__APP_CONFIG__ = {
  apiBase: "http://localhost:5000/api",
};
```

### 6. Run locally
Frontend:
```bash
npm run dev
```

Backend:
```bash
npm --prefix backend run dev
```

## Build
```bash
npm run build
```

Build output goes to `dist/` and includes:
- `index.html`
- `project.html`
- `admin.html`
- `app.config.js`
- static assets and styles

## Deploy notes

A simple deployment split:

- Static frontend host for `dist/`
- Node web service for `backend/`
- Managed MySQL database

### Runtime config
The frontend reads API base in this order:
1. `window.__APP_CONFIG__.apiBase` from `app.config.js`
2. `<meta name="api-base">`
3. fallback to `http://localhost:5000/api`

For production, set `app.config.js` to your deployed API URL.

### Uploads
Uploaded project images are stored in `backend/uploads/` and exposed at `/uploads/*`.
If deploying to an ephemeral container, move uploads to object storage later.

## CI
GitHub Actions workflow at `.github/workflows/ci.yml` currently verifies:
- frontend install
- backend install
- production build
- backend app bootstraps without syntax errors

## Production backlog
Recommended next upgrades after this baseline:

- move uploads to S3/Cloudinary
- add server-side validation layer for every route
- add API tests and smoke tests
- add structured SEO metadata and sitemap generation
- move analytics from snapshot-only to time-ranged dashboard
- add publish scheduling and richer draft preview URLs

## Source of truth
Current source of truth for project and skill content should be the backend database.
`data/*.json` exists as a static fallback for resilience in frontend demos and local development.
