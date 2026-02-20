# OPs - Project Structure

```
OPs/
├── backend/                          # Node.js Express API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js              # Login endpoint
│   │   │   ├── operations.js        # CRUD operations + upload
│   │   │   └── stats.js             # Statistics aggregation
│   │   ├── services/
│   │   │   └── ocr.js               # PaddleOCR integration
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT authentication
│   │   ├── utils/
│   │   │   └── helpers.js           # Hashing, validation
│   │   └── server.js                # Express app entry point
│   ├── prisma/
│   │   └── schema.prisma            # Database schema (PostgreSQL)
│   ├── .env                         # Backend environment variables
│   ├── .dockerignore
│   ├── Dockerfile                   # Backend container
│   └── package.json                 # Backend dependencies
│
├── frontend/                        # React SPA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Dashboard.jsx        # Main dashboard
│   │   │   └── Stats.jsx            # Statistics page
│   │   ├── components/
│   │   │   ├── Layout.jsx           # App layout + navigation
│   │   │   ├── UploadForm.jsx       # File upload component
│   │   │   ├── OperationsList.jsx   # Operations table
│   │   │   └── OperationEditor.jsx  # Inline editor
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Authentication state
│   │   │   └── LanguageContext.jsx  # German/English i18n
│   │   ├── App.jsx                  # Root component
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Tailwind imports
│   ├── nginx.conf                   # Production web server config
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.js           # Tailwind CSS config
│   ├── postcss.config.js
│   ├── index.html
│   ├── .dockerignore
│   ├── Dockerfile                   # Frontend container (multi-stage)
│   └── package.json                 # Frontend dependencies
│
├── uploads/                         # Media storage (created at runtime)
├── pgdata/                          # PostgreSQL data (created at runtime)
│
├── docker-compose.yml               # Orchestration (4 services)
├── start.sh                         # Easy startup script
├── .env                             # Root environment variables
├── .gitignore
├── package.json                     # Root scripts
├── README.md                        # Complete documentation
├── QUICKSTART.md                    # Quick start guide
├── PROJECT_STRUCTURE.md             # This file
└── LICENSE

Docker Services:
├── postgres        (PostgreSQL 16)      Port 5432
├── ocr             (PaddleOCR)          Port 8000
├── backend         (Node.js API)        Port 5000
└── frontend        (React + Nginx)      Port 3000
```

## Key Files

### Backend Core
- `backend/src/server.js` - Express application setup
- `backend/src/routes/operations.js` - Main CRUD API (upload, edit, delete)
- `backend/src/services/ocr.js` - OCR text extraction and parsing
- `backend/prisma/schema.prisma` - Database model definition

### Frontend Core
- `frontend/src/App.jsx` - React Router configuration
- `frontend/src/pages/Dashboard.jsx` - Main operations view
- `frontend/src/pages/Stats.jsx` - Recharts visualizations
- `frontend/src/context/AuthContext.jsx` - JWT token management

### Infrastructure
- `docker-compose.yml` - Service definitions and networking
- `backend/Dockerfile` - Node.js container
- `frontend/Dockerfile` - Multi-stage build (React → Nginx)
- `frontend/nginx.conf` - Reverse proxy for API calls

## Data Flow

1. **Document Upload:**
   ```
   User → Upload Form → Backend API → Multer (save file)
   → OCR Service → Parse text → Save to PostgreSQL
   ```

2. **Manual Edit:**
   ```
   User → Edit Form → Backend API → Validate fields
   → Update PostgreSQL → Recalculate completeness
   ```

3. **Statistics:**
   ```
   User → Stats Page → Backend API → Aggregate queries
   → Return JSON → Recharts visualization
   ```

## Technology Stack

**Frontend:**
- React 18.3 - UI framework
- React Router 6 - Navigation
- Tailwind CSS 3 - Styling
- Recharts 2 - Charts
- Vite 6 - Build tool

**Backend:**
- Node.js 20 - Runtime
- Express 4 - Web framework
- Prisma 5 - ORM
- Multer 1.4 - File uploads
- JWT - Authentication

**Database:**
- PostgreSQL 16 - Relational database

**OCR:**
- PaddleOCR - Text extraction

**Deployment:**
- Docker - Containerization
- Docker Compose - Orchestration
- Nginx - Production web server

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
PORT=5000
OCR_SERVICE_URL=http://ocr:8000
```

### Frontend (via nginx proxy)
- API calls proxied to backend:5000

## Network Architecture

```
┌─────────────────────────────────────────┐
│          Docker Network (ops-network)    │
│                                          │
│  ┌──────────┐    ┌──────────┐           │
│  │ Frontend │───▶│ Backend  │           │
│  │  :3000   │    │  :5000   │           │
│  └──────────┘    └─────┬────┘           │
│                        │                 │
│                  ┌─────┴─────┐          │
│                  │           │          │
│           ┌──────▼────┐  ┌──▼────┐     │
│           │ Postgres  │  │  OCR  │     │
│           │   :5432   │  │ :8000 │     │
│           └───────────┘  └───────┘     │
│                                         │
└─────────────────────────────────────────┘
         │
         │ Port Mapping
         ▼
   Host: localhost:3000
```

## Security Features

1. **Authentication:** JWT tokens with 7-day expiry
2. **Data Privacy:** Patient ID hashing (SHA-256)
3. **Network Isolation:** Docker internal network
4. **File Validation:** JPEG/PDF only
5. **No External Calls:** 100% self-hosted

## Customization Points

- Change credentials: `backend/src/routes/auth.js`
- Adjust colors: `frontend/tailwind.config.js`
- Modify schema: `backend/prisma/schema.prisma`
- Add translations: `frontend/src/context/LanguageContext.jsx`
- Tune OCR: `backend/src/services/ocr.js`

---

**Dr. Mohamed Sabry, Alsfeld Hessen**
