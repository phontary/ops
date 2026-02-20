# OPs - Surgical Operation Documentation System

Self-hosted Dockerized web application for private surgeon OP documentation with OCR integration.

## Features

- **Single-user authentication** (username: `sabry`, password: `pass`)
- **Document upload** with automatic OCR processing (JPEG/PDF)
- **Bilingual interface** (German/English)
- **Complete OP documentation** with mandatory field tracking
- **Statistics dashboard** with charts and analytics
- **CSV export** for data backup
- **Fully self-hosted** - No external APIs or cloud services
- **Privacy-focused** - Patient ID hashing, local-only data

## Tech Stack

- **Backend**: Node.js, Express, Prisma ORM
- **Frontend**: React, Tailwind CSS, Recharts
- **Database**: PostgreSQL
- **OCR**: PaddleOCR (self-hosted)
- **Deployment**: Docker Compose

## Quick Start

### Prerequisites

- Docker
- Docker Compose

### Installation

1. Clone or extract the project

2. Start all services:
```bash
docker-compose up -d
```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

4. Login credentials:
   - Username: `sabry`
   - Password: `pass`

### Stopping the Application

```bash
docker-compose down
```

## Database Schema

The system uses a single `Operation` model with these fields:

- `op_id` - Unique operation ID (OP-YYYY-MM-DD)
- `datum` - Operation date
- `patient_id` - Hashed patient identifier
- `diagnose` - Diagnosis
- `op_anlage` - Operation setup
- `anasthesie_typ` - Anesthesia type
- `lagerung` - Patient positioning
- `op_team` - Operating team members
- `op_verlauf` - Operation course (rich text)
- `pathologie_befund` - Pathology findings
- `dauer_min` - Duration in minutes
- `blutverlust_ml` - Blood loss in ml
- `materials` - Surgical materials used (JSON)
- `times` - Operation phases timeline (JSON)
- `media` - Uploaded images/PDFs (JSON)
- `raw_ocr` - Raw OCR output
- `complete` - Completion status (auto-calculated)
- `stats_icd` - Extracted ICD codes for statistics

## Mandatory Fields

Operations must have these fields completed:
- `datum` (date)
- `diagnose` (diagnosis)
- `anasthesie_typ` (anesthesia type)
- `dauer_min` (duration)
- `pathologie_befund` (pathology results)
- `blutverlust_ml` (blood loss)

Missing fields are highlighted in red on the dashboard.

## OCR Integration

The system automatically processes uploaded documents:

1. Upload JPEG or PDF files
2. PaddleOCR extracts text and tables
3. Data is parsed and mapped to operation fields
4. User can manually edit any extracted information

## Data Privacy

- All data stored locally in Docker volumes
- Patient IDs are one-way hashed (SHA-256)
- No external API calls
- No cloud services
- No telemetry

## Directory Structure

```
.
├── backend/              # Node.js Express API
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # OCR processing
│   │   ├── middleware/  # Authentication
│   │   └── utils/       # Helper functions
│   ├── prisma/          # Database schema
│   └── Dockerfile
├── frontend/            # React SPA
│   ├── src/
│   │   ├── pages/       # Login, Dashboard, Stats
│   │   ├── components/  # Reusable components
│   │   └── context/     # Auth & Language
│   ├── nginx.conf
│   └── Dockerfile
├── uploads/             # Media storage
├── pgdata/              # PostgreSQL data
└── docker-compose.yml   # Service orchestration
```

## API Endpoints

- `POST /api/auth/login` - User authentication
- `POST /api/ops/upload` - Upload documents with OCR
- `GET /api/ops` - List all operations
- `GET /api/ops/:id` - Get single operation
- `PATCH /api/ops/:id` - Update operation
- `DELETE /api/ops/:id` - Delete operation
- `GET /api/ops/export/csv` - Export to CSV
- `GET /api/stats` - Get statistics

## Statistics

The stats page shows:
- Total operations count
- Average operation duration
- Operations by year (line chart)
- Operations by diagnosis (pie chart)
- Operations by ICD code (bar chart)
- Top diagnoses table

## Development

### Backend Development

```bash
cd backend
npm install
npm run dev
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

## Backup

Data is stored in:
- `./pgdata/` - PostgreSQL database
- `./uploads/` - Uploaded media files

Backup these directories regularly.

## Security Notes

- Change the JWT_SECRET in production
- Use HTTPS in production (nginx reverse proxy)
- Keep Docker images updated
- Restrict network access to localhost only

## Credits

**Dr. Mohamed Sabry, Alsfeld Hessen**

## License

See LICENSE file for details.
