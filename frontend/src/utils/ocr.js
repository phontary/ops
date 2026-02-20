import { createWorker } from 'tesseract.js';

export async function performOCR(files) {
  const worker = await createWorker('deu');
  const results = [];

  for (const file of files) {
    try {
      const { data: { text } } = await worker.recognize(file);
      results.push(text);
    } catch (error) {
      console.error('OCR error:', error);
      results.push('');
    }
  }

  await worker.terminate();
  return results;
}

export function extractOperationData(textArray) {
  const combinedText = textArray.join('\n');

  return {
    datum: extractDate(combinedText),
    patient_id: null,
    diagnose: extractDiagnose(combinedText),
    op_anlage: null,
    anasthesie_typ: extractAnasthesieTyp(combinedText),
    lagerung: extractLagerung(combinedText),
    op_team: extractTeam(combinedText),
    op_verlauf: extractOpVerlauf(combinedText),
    pathologie_befund: extractPathologie(combinedText),
    dauer_min: extractDuration(combinedText),
    blutverlust_ml: extractBlutverlust(combinedText),
    materials: extractMaterials(combinedText),
    times: extractTimes(combinedText),
    stats_icd: []
  };
}

function extractDate(text) {
  const datePattern = /(\d{1,2})\.(\d{1,2})\.(\d{4})/;
  const match = text.match(datePattern);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return new Date().toISOString().split('T')[0];
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
