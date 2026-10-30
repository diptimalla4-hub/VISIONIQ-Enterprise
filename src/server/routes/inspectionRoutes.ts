import { Router } from 'express';
import { db } from '../db.ts';
import { authenticateToken, AuthenticatedRequest } from '../auth.ts';
import { inspectionInputSchema } from '../schemas.ts';
import { analyzeVisualAsset } from '../ai.ts';
import { SampleMediaItem } from '../../types/index.ts';

export const inspectionRouter = Router();

// Sample preloaded assets for immediate 1-click testing
const SAMPLE_MEDIA: SampleMediaItem[] = [
  {
    id: 'sample-weld',
    title: 'Aerospace Titanium Weld Joint',
    domain: 'Industrial Manufacturing',
    description: 'Precision laser-welded flange seam under high thermal stress inspection.',
    imageUrl: '/src/assets/images/inspection_industrial_weld_1793339757303.jpg',
    expectedAnomaly: 'Micro-fissure along vertical bead & porosity',
    recommendedProfile: 'Industrial Defect (Tolerance: 0.2mm)'
  },
  {
    id: 'sample-infrastructure',
    title: 'Reinforced Highway Pier #4',
    domain: 'Infrastructure & Safety',
    description: 'Civil concrete structural column bearing heavy overpass roadway loads.',
    imageUrl: '/src/assets/images/inspection_infrastructure_crack_1793339758337.jpg',
    expectedAnomaly: 'Vertical shear fracture & rebar corrosion stain',
    recommendedProfile: 'Structural Integrity (Aperture: >15mm)'
  },
  {
    id: 'sample-ppe',
    title: 'Robotic Cell Unit 4 Floor',
    domain: 'Infrastructure & Safety',
    description: 'Active assembly station with technicians near multi-axis robotic arms.',
    imageUrl: '/src/assets/images/inspection_safety_ppe_1793339758970.jpg',
    expectedAnomaly: 'Nominal (100% OSHA PPE & interlock compliance)',
    recommendedProfile: 'Workplace Safety & PPE Monitoring'
  },
  {
    id: 'sample-retail',
    title: 'Supermarket Aisle 3 Cereal Bay',
    domain: 'Retail & Inventory',
    description: 'Retail grocery planogram compliance audit and packaging integrity inspection.',
    imageUrl: '/src/assets/images/inspection_retail_shelf_1793339758970.jpg',
    expectedAnomaly: 'Crushed box defect & planogram deviation',
    recommendedProfile: 'Retail Planogram & Package Quality'
  }
];

// GET /api/sample-media
inspectionRouter.get('/sample-media', (_req, res) => {
  res.json({ samples: SAMPLE_MEDIA });
});

// GET /api/analytics/summary
inspectionRouter.get('/analytics/summary', authenticateToken, (_req: AuthenticatedRequest, res) => {
  try {
    const summary = db.getAnalyticsSummary();
    res.json(summary);
  } catch (err: any) {
    console.error('Error fetching analytics summary:', err);
    res.status(500).json({ error: 'Failed to compute analytics summary.' });
  }
});

// GET /api/inspections
inspectionRouter.get('/inspections', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const domain = req.query.domain as string | undefined;
    const severity = req.query.severity as string | undefined;
    const search = req.query.search as string | undefined;
    const anomalyParam = req.query.anomalyDetected as string | undefined;

    let anomalyDetected: boolean | undefined = undefined;
    if (anomalyParam === 'true') anomalyDetected = true;
    if (anomalyParam === 'false') anomalyDetected = false;

    const inspections = db.getInspections(user, {
      domain,
      severity,
      search,
      anomalyDetected
    });

    res.json({ inspections });
  } catch (err: any) {
    console.error('Error fetching inspections:', err);
    res.status(500).json({ error: 'Failed to fetch inspections.' });
  }
});

// POST /api/inspections/analyze
inspectionRouter.post('/inspections/analyze', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const parseResult = inspectionInputSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.format()
      });
      return;
    }

    const { domain, mediaBase64, mimeType, sensitivity, model, focusAreas, customNotes } = parseResult.data;

    // Run AI Visual Analysis through Google Gemini Vision
    const aiResult = await analyzeVisualAsset(mediaBase64, mimeType, domain, {
      sensitivity,
      model,
      focusAreas,
      customNotes
    });

    // Check if mediaBase64 is a relative URL or full base64 data
    const isUrl = mediaBase64.startsWith('http') || mediaBase64.startsWith('/src/assets/');
    const mediaUrl = isUrl ? mediaBase64 : `data:${mimeType};base64,${mediaBase64.replace(/^data:[^;]+;base64,/, '')}`;

    const inspection = db.createInspection({
      userId: user.id,
      domain,
      mediaUrl,
      status: 'Completed',
      anomalyDetected: aiResult.anomalyDetected,
      severity: aiResult.severity,
      confidenceScore: aiResult.confidenceScore,
      summary: aiResult.summary,
      rawAiResponse: aiResult,
      userName: user.name,
      userEmail: user.email
    });

    res.status(201).json({
      message: 'Inspection completed successfully',
      inspection
    });
  } catch (err: any) {
    console.error('Inspection analysis error:', err);
    res.status(500).json({ error: 'Failed to analyze visual asset. ' + (err.message || '') });
  }
});

// GET /api/inspections/:id
inspectionRouter.get('/inspections/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid inspection ID.' });
      return;
    }

    const result = db.getInspectionById(id, req.user!);
    if (!result) {
      res.status(404).json({ error: 'Inspection record not found or access denied.' });
      return;
    }

    res.json(result);
  } catch (err: any) {
    console.error('Error fetching inspection details:', err);
    res.status(500).json({ error: 'Failed to retrieve inspection details.' });
  }
});

// DELETE /api/inspections/:id
inspectionRouter.delete('/inspections/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid inspection ID.' });
      return;
    }

    const success = db.deleteInspection(id, req.user!);
    if (!success) {
      res.status(403).json({ error: 'Permission denied or inspection does not exist.' });
      return;
    }

    res.json({ message: 'Inspection deleted successfully.' });
  } catch (err: any) {
    console.error('Error deleting inspection:', err);
    res.status(500).json({ error: 'Failed to delete inspection.' });
  }
});
