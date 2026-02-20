# OPs - Quick Start Guide

## What is OPs?

OPs is a completely self-hosted surgical operation documentation system that runs entirely on your local machine using Docker. It provides automated OCR processing of surgical documents, comprehensive OP tracking, and statistical analysis - all while keeping your data 100% private.

## Installation (5 minutes)

### 1. Prerequisites

Make sure you have installed:
- **Docker Desktop** (includes Docker Compose)
  - Download from: https://www.docker.com/products/docker-desktop/

### 2. Start the Application

#### Option A: Using the startup script (Recommended)
```bash
./start.sh
```

#### Option B: Using Docker Compose directly
```bash
docker-compose up -d
```

### 3. Wait for Services to Start

The first time you run OPs, it will download the required Docker images. This may take 2-5 minutes depending on your internet connection.

Wait about 30-60 seconds after the download completes for all services to initialize.

### 4. Access the Application

Open your browser and go to:
```
http://localhost:3000
```

### 5. Login

Use these credentials:
- **Username:** `sabry`
- **Password:** `pass`

## Using OPs

### Upload Documents

1. Go to the **Dashboard** page
2. Click or drag files to the upload area
3. Select JPEG or PDF files of surgical documentation
4. Click "Upload Files"
5. The system will automatically extract information using OCR

### Review Operations

Operations are listed in the dashboard table with:
- **Green badge** = Complete (all mandatory fields filled)
- **Red badge** = Incomplete (shows missing fields)

### Edit Operation Details

1. Click **"Edit"** on any operation
2. Modify any fields manually
3. Click **"Save"** to update
4. The system automatically rechecks completeness

### View Statistics

1. Go to the **Statistics** page
2. View charts showing:
   - Operations by year (line chart)
   - Operations by diagnosis (pie chart)
   - Operations by ICD code (bar chart)
   - Summary statistics

### Export Data

1. From the Dashboard, click **"Export CSV"**
2. Download a CSV file with all operation data
3. Use for backup or external analysis

## Mandatory Fields

Each operation must have:
- ✓ Date (`datum`)
- ✓ Diagnosis (`diagnose`)
- ✓ Anesthesia type (`anasthesie_typ`)
- ✓ Duration in minutes (`dauer_min`)
- ✓ Pathology findings (`pathologie_befund`)
- ✓ Blood loss in ml (`blutverlust_ml`)

Missing fields are highlighted in red.

## Language Toggle

Click the **DE/EN** button in the top navigation to switch between German and English.

## Stopping the Application

To stop all services:
```bash
docker-compose down
```

Your data is preserved in the `pgdata/` folder and will be available when you restart.

## Viewing Logs

To see what's happening behind the scenes:
```bash
docker-compose logs -f
```

Press `Ctrl+C` to stop viewing logs.

## Troubleshooting

### Services won't start
```bash
docker-compose down
docker-compose up -d --force-recreate
```

### Can't access http://localhost:3000
- Wait 60 seconds for services to fully initialize
- Check logs: `docker-compose logs frontend`
- Verify Docker is running: `docker ps`

### OCR not working
- Check OCR service: `docker-compose logs ocr`
- Restart OCR: `docker-compose restart ocr`

### Database errors
- Check database: `docker-compose logs postgres`
- Restart backend: `docker-compose restart backend`

## Data Privacy

✓ All data stays on your local machine
✓ No external API calls
✓ No cloud services
✓ Patient IDs are one-way hashed
✓ No telemetry or tracking

## Backup

Your data is stored in:
- `./pgdata/` - Database
- `./uploads/` - Uploaded files

**Important:** Backup these folders regularly!

## System Requirements

- **OS:** Windows, macOS, or Linux
- **RAM:** 4GB minimum, 8GB recommended
- **Disk:** 2GB for Docker images + storage for your uploads
- **Docker:** Version 20.10 or higher

## Architecture

The system consists of:
1. **Frontend** (React + Tailwind) - Port 3000
2. **Backend** (Node.js + Express) - Port 5000
3. **Database** (PostgreSQL) - Port 5432
4. **OCR Service** (PaddleOCR) - Port 8000

All services communicate through an internal Docker network and are not exposed to the internet.

## Changing the Password

Edit `backend/src/routes/auth.js` and change:
```javascript
if (username === 'sabry' && password === 'YOUR_NEW_PASSWORD') {
```

Then rebuild:
```bash
docker-compose down
docker-compose up -d --build
```

## Getting Help

Check the full documentation in `README.md` for:
- Complete API documentation
- Database schema details
- Development setup
- Security best practices

---

**Dr. Mohamed Sabry, Alsfeld Hessen**
