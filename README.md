# School OS

| Folder | What it is | Run locally |
|---|---|---|
| [backend/](backend/) | Express + TypeScript REST API | `cd backend && npm install && npm run dev` |
| [frontend/](frontend/) | React + Vite single-page app | `cd frontend && npm install && npm run dev` |
| [license-server/](license-server/) | Identity and licensing service (OIDC) — design docs only so far | — |

Each folder is an independent project with its own `package.json`, lockfile, `.env.example` and `docs/`.
Start with [backend/docs/README.md](backend/docs/README.md) for architecture, the implementation plan and ADRs.
