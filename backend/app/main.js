/**
 * StepCounter AI Analytics — Express.js Server
 *
 * Node.js port of the FastAPI backend.
 * Endpoints:
 *   GET  /health          → Health check
 *   POST /api/v1/analyze  → Accepts { daily_steps: number[], goal: number }
 */

import express from 'express';
import cors from 'cors';
import { analyzeSteps } from './analytics.js';

const app = express();
const PORT = process.env.PORT || 8000;

// ─── Middleware ───
app.use(cors());
app.use(express.json());

// ─── Health Check ───
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy' });
});

// ─── Analytics Endpoint ───
app.post('/api/v1/analyze', (req, res) => {
  try {
    const { daily_steps, goal = 10000 } = req.body;

    // ─── Validation ───
    if (!daily_steps || !Array.isArray(daily_steps)) {
      return res.status(422).json({
        error: 'Validation Error',
        detail: 'daily_steps must be a non-empty array of integers',
      });
    }
    if (daily_steps.length < 1 || daily_steps.length > 30) {
      return res.status(422).json({
        error: 'Validation Error',
        detail: 'daily_steps must have between 1 and 30 elements',
      });
    }
    if (!daily_steps.every(s => Number.isInteger(s) && s >= 0)) {
      return res.status(422).json({
        error: 'Validation Error',
        detail: 'Each step count must be a non-negative integer',
      });
    }
    if (!Number.isInteger(goal) || goal <= 0) {
      return res.status(422).json({
        error: 'Validation Error',
        detail: 'goal must be a positive integer',
      });
    }

    // ─── Run Analytics ───
    const result = analyzeSteps(daily_steps, goal);
    return res.json(result);
  } catch (err) {
    console.error('Analytics error:', err);
    return res.status(500).json({ error: 'Internal Server Error', detail: err.message });
  }
});

// ─── Start Server ───
app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════════╗');
  console.log('  ║  🏃 StepCounter AI Analytics Server         ║');
  console.log(`  ║  🌐 Running on http://localhost:${PORT}        ║`);
  console.log('  ║  📊 POST /api/v1/analyze                    ║');
  console.log('  ║  💚 GET  /health                            ║');
  console.log('  ╚══════════════════════════════════════════════╝');
  console.log('');
});
