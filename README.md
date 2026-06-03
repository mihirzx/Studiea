# Studiea

AI-powered classroom intelligence platform for middle school STEM education.

## What it does

Studiea uses 4 communicating AI agents to automate the full classroom loop:

1. **Notetaker** — transcribes class recordings into structured notes
2. **HW Generator** — creates personalized STEM homework from those notes
3. **Grader** — grades submissions with teacher-guided rubrics and flags struggling students
4. **Study Buddy** — gives each student a daily personalized study plan and live tutoring chat

## Tech stack

- Google Cloud Agent Builder + Gemini 2.0 Flash (all agents)
- MongoDB Atlas (M0) + MongoDB MCP
- GCP Speech-to-Text
- Node.js + Express (backend + agents)
- React + Vite + Tailwind CSS (frontend)
- Hex (teacher analytics dashboard)

## Repository structure

```
studiea/
├── backend/    # Express API, 4 agents, MongoDB models, security middleware
├── frontend/   # React + Vite + Tailwind client (teacher + student portals)
└── STUDIEA_TECHNICAL_BIBLE.md   # full build specification
```

See [STUDIEA_TECHNICAL_BIBLE.md](STUDIEA_TECHNICAL_BIBLE.md) for the complete architecture,
security model, schema, API routes, agent specs, and deployment guide.

## Setup

1. Clone the repo
2. Copy `.env.example` to `.env` and fill in all values
3. Install dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
4. Run both dev servers (in separate terminals):
   ```bash
   cd backend && npm run dev     # http://localhost:3001
   cd frontend && npm run dev    # http://localhost:5173
   ```

## Environment variables

See [`.env.example`](.env.example) for all required keys (JWT, internal secret, MongoDB Atlas
URI, Gemini API key, GCP project/bucket).

## Deployment

Both services deploy to **GCP Cloud Run** (one per Dockerfile), with MongoDB Atlas and a private
GCS audio bucket. Full deploy steps — Secret Manager, VPC connector, Atlas IP whitelist — are in
the Deployment section of the technical bible.

## Security highlights

- NoSQL injection prevention (`express-mongo-sanitize`)
- Prompt-injection defense via XML tag isolation in every agent prompt
- JWT auth with per-resource ownership checks in controllers
- Internal-secret auth for agent-only endpoints
- File-upload magic-byte validation, rate limiting, teacher-gated grade approval

## License

MIT
