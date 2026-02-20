import fetch from 'node-fetch';
import { readFileSync } from 'fs';

const OCR_URL = process.env.OCR_SERVICE_URL || 'http://ocr:8000';

export async function processOCR(files) {
  const results = {
    datum: null,
    patient_id: null,
    diagnose: '',
    op_anlage: null,
    anasthesie_typ: '',
    lagerung: null,
    op_team: [],
    op_verlauf: null,
    pathologie_befund: null,
    dauer_min: 0,
    blutverlust_ml: null,
    materials: [],
    times: [],
    stats_icd: [],
    raw: {}
  };

  const allText = [];

  for (const file of files) {
    try {
      const formData = new FormData();
      const fileBuffer = readFileSync(file.path);
      const blob = new Blob([fileBuffer], { type: file.mimetype });
      formData.append('image', blob, file.originalname);

      const response = await fetch(`${OCR_URL}/ocr`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const ocrData = await response.json();
        allText.push(ocrData.text || '');
        results.raw[file.filename] = ocrData;
      }
    } catch (error) {
      console.error(`OCR error for ${file.filename}:`, error.message);
    }
  }

  const combinedText = allText.join('\n');

  results.datum = extractDate(combinedText);
  results.diagnose = extractDiagnose(combinedText);
  results.anasthesie_typ = extractAnasthesieTyp(combinedText);
  results.lagerung = extractLagerung(combinedText);
  results.op_team = extractTeam(combinedText);
  results.op_verlauf = extractOpVerlauf(combinedText);
  results.pathologie_befund = extractPathologie(combinedText);
  results.dauer_min = extractDuration(combinedText);
  results.blutverlust_ml = extractBlutverlust(combinedText);
  results.materials = extractMaterials(combinedText);
  results.times = extractTimes(combinedText);
  results.stats_icd = extractICDCodes(results.diagnose);

  return results;
}

function extractDate(text) {
  const datePattern = /(\d{1,2})\.(\d{1,2})\.(\d{4})/;
  const match = text.match(datePattern);
  if (match) {
    const [, day, month, year] = match;
    return new Date(`${year}-${month}-${day}`);
  }
  return new Date();
}

function extractDiagnose(text) {
  const diagnosePatterns = [
    /Diagnose[:\s]+([^\n]+)/i,
    /Indikation[:\s]+([^\n]+)/i
  ];

  for (const pattern of diagnosePatterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return '';
}

function extractAnasthesieTyp(text) {
  const patterns = [
    /Anästhesie[:\s]+([^\n]+)/i,
    /Narkose[:\s]+([^\n]+)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return '';
}

function extractLagerung(text) {
  const match = text.match(/Lagerung[:\s]+([^\n]+)/i);
  return match ? match[1].trim() : null;
}

function extractTeam(text) {
  const team = [];
  const namePattern = /(Dr\.|Prof\.)?\s*([A-ZÄÖÜ][a-zäöüß]+)\s+([A-ZÄÖÜ]\.?)/g;
  let match;

  while ((match = namePattern.exec(text)) !== null) {
    const name = match[0].trim();
    if (!team.includes(name)) {
      team.push(name);
    }
  }

  return team.slice(0, 5);
}

function extractOpVerlauf(text) {
  const patterns = [
    /OP-Verlauf[:\s]+([^]+?)(?=\n\n|Pathologie|Material|$)/i,
    /Verlauf[:\s]+([^]+?)(?=\n\n|Pathologie|Material|$)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
}

function extractPathologie(text) {
  const patterns = [
    /Pathologie[:\s]+([^]+?)(?=\n\n|Material|$)/i,
    /Histologie[:\s]+([^]+?)(?=\n\n|Material|$)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
}

function extractDuration(text) {
  const patterns = [
    /Dauer[:\s]+(\d+)\s*min/i,
    /OP-Dauer[:\s]+(\d+)/i,
    /(\d+)\s*Minuten/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return parseInt(match[1]);
  }
  return 0;
}

function extractBlutverlust(text) {
  const patterns = [
    /Blutverlust[:\s]+(\d+)\s*ml/i,
    /(\d+)\s*ml\s+Blutverlust/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return parseInt(match[1]);
  }
  return null;
}

function extractMaterials(text) {
  const materials = [];
  const materialPatterns = [
    /PDS\s+II\s+[\d\-\/]+/gi,
    /Vicryl\s+[\d\-\/]+/gi,
    /Prolene\s+[\d\-\/]+/gi
  ];

  materialPatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      materials.push({
        name: match[0],
        menge: 1,
        charge: ''
      });
    }
  });

  return materials;
}

function extractTimes(text) {
  const times = [];
  const timePattern = /(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/g;
  let match;

  while ((match = timePattern.exec(text)) !== null) {
    times.push({
      phase: 'Phase',
      start: `${match[1]}:${match[2]}`,
      ende: `${match[3]}:${match[4]}`
    });
  }

  return times;
}

function extractICDCodes(diagnose) {
  const icdPattern = /[A-Z]\d{2}\.?\d*/g;
  const matches = diagnose.match(icdPattern);
  return matches ? [...new Set(matches)] : [];
}
