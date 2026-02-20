import express from 'express';
import multer from 'multer';
import { supabase } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { processOCR } from '../services/ocr.js';
import { checkMandatoryFields, generateOpId, hashPatientId } from '../utils/helpers.js';
import { existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

const uploadsDir = join(__dirname, '../../../uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PDF files allowed'));
    }
  }
});

router.post('/upload', authenticate, upload.array('files', 10), async (req, res) => {
  try {
    const files = req.files;
    const { op_id, datum } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const opId = op_id || generateOpId(datum ? new Date(datum) : new Date());

    const ocrResults = await processOCR(files);

    const media = files.map((file, index) => ({
      filename: file.filename,
      originalname: file.originalname,
      page: index + 1
    }));

    const operationData = {
      op_id: opId,
      datum: datum ? new Date(datum) : ocrResults.datum || new Date(),
      patient_id: ocrResults.patient_id ? hashPatientId(ocrResults.patient_id) : null,
      diagnose: ocrResults.diagnose || '',
      op_anlage: ocrResults.op_anlage || null,
      anasthesie_typ: ocrResults.anasthesie_typ || '',
      lagerung: ocrResults.lagerung || null,
      op_team: ocrResults.op_team || [],
      op_verlauf: ocrResults.op_verlauf || null,
      pathologie_befund: ocrResults.pathologie_befund || null,
      dauer_min: ocrResults.dauer_min || 0,
      blutverlust_ml: ocrResults.blutverlust_ml || null,
      materials: ocrResults.materials || [],
      times: ocrResults.times || [],
      media,
      raw_ocr: ocrResults.raw || {},
      stats_icd: ocrResults.stats_icd || [],
      complete: false
    };

    const missingFields = checkMandatoryFields(operationData);
    operationData.complete = missingFields.length === 0;

    const { data: existingOp } = await supabase
      .from('operations')
      .select('*')
      .eq('op_id', opId)
      .maybeSingle();

    let operation;
    if (existingOp) {
      const { data, error } = await supabase
        .from('operations')
        .update(operationData)
        .eq('op_id', opId)
        .select()
        .single();

      if (error) throw error;
      operation = data;
    } else {
      const { data, error } = await supabase
        .from('operations')
        .insert(operationData)
        .select()
        .single();

      if (error) throw error;
      operation = data;
    }

    res.json({
      success: true,
      operation,
      missing_fields: missingFields
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const { data: operations, error } = await supabase
      .from('operations')
      .select('*')
      .order('datum', { ascending: false });

    if (error) throw error;

    const opsWithMissing = (operations || []).map(op => ({
      ...op,
      missing_fields: checkMandatoryFields(op)
    }));

    res.json(opsWithMissing);
  } catch (error) {
    console.error('Fetch operations error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const { data: operation, error } = await supabase
      .from('operations')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;

    if (!operation) {
      return res.status(404).json({ error: 'Operation not found' });
    }

    res.json({
      ...operation,
      missing_fields: checkMandatoryFields(operation)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.patient_id) {
      updateData.patient_id = hashPatientId(updateData.patient_id);
    }

    const { data: operation, error } = await supabase
      .from('operations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const missingFields = checkMandatoryFields(operation);
    const { data: finalOperation, error: updateError } = await supabase
      .from('operations')
      .update({ complete: missingFields.length === 0 })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      ...finalOperation,
      missing_fields: missingFields
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { error } = await supabase
      .from('operations')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/export/csv', authenticate, async (req, res) => {
  try {
    const { data: operations, error } = await supabase
      .from('operations')
      .select('*')
      .order('datum', { ascending: false });

    if (error) throw error;

    const csvHeader = 'OP-ID,Datum,Diagnose,Anästhesie,Dauer (Min),Blutverlust (ml),Team,Pathologie,Vollständig\n';
    const csvRows = (operations || []).map(op => {
      const datum = new Date(op.datum).toLocaleDateString('de-DE');
      const team = op.op_team.join('; ');
      return `"${op.op_id}","${datum}","${op.diagnose}","${op.anasthesie_typ}",${op.dauer_min},${op.blutverlust_ml || ''},"${team}","${op.pathologie_befund || ''}",${op.complete ? 'Ja' : 'Nein'}`;
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=operations.csv');
    res.send(csvHeader + csvRows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
