import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const operations = await prisma.operation.findMany();

    const byYear = {};
    const byDiagnose = {};
    const byICD = {};

    operations.forEach(op => {
      const year = new Date(op.datum).getFullYear();
      byYear[year] = (byYear[year] || 0) + 1;

      byDiagnose[op.diagnose] = (byDiagnose[op.diagnose] || 0) + 1;

      op.stats_icd.forEach(icd => {
        byICD[icd] = (byICD[icd] || 0) + 1;
      });
    });

    const yearData = Object.entries(byYear).map(([year, count]) => ({
      year: parseInt(year),
      count
    })).sort((a, b) => a.year - b.year);

    const diagnoseData = Object.entries(byDiagnose).map(([diagnose, count]) => ({
      diagnose,
      count
    })).sort((a, b) => b.count - a.count);

    const icdData = Object.entries(byICD).map(([icd, count]) => ({
      icd,
      count
    })).sort((a, b) => b.count - a.count);

    res.json({
      total: operations.length,
      avgDuration: operations.length > 0
        ? Math.round(operations.reduce((sum, op) => sum + op.dauer_min, 0) / operations.length)
        : 0,
      byYear: yearData,
      byDiagnose: diagnoseData,
      byICD: icdData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
