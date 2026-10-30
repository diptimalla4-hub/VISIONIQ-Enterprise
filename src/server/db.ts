import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, Inspection, AuditLog, AnalyticsSummary, SeverityLevel } from '../types/index.ts';

interface DBStore {
  users: Array<User & { passwordHash: string }>;
  inspections: Inspection[];
  auditLogs: AuditLog[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'visioniq.json');

class Database {
  private store: DBStore = {
    users: [],
    inspections: [],
    auditLogs: []
  };
  private nextUserId = 1;
  private nextInspectionId = 1;
  private nextAuditLogId = 1;

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.store = JSON.parse(raw);
        this.nextUserId = Math.max(0, ...this.store.users.map((u) => u.id)) + 1;
        this.nextInspectionId = Math.max(0, ...this.store.inspections.map((i) => i.id)) + 1;
        this.nextAuditLogId = Math.max(0, ...this.store.auditLogs.map((a) => a.id)) + 1;
      } else {
        this.seedInitialData();
        this.save();
      }
    } catch (err) {
      console.error('Error initializing database, seeding defaults:', err);
      this.seedInitialData();
      this.save();
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.store, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  private seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    const defaultPasswordHash = bcrypt.hashSync('VisionIQ2026!', salt);
    const now = new Date();

    const adminUser: User & { passwordHash: string } = {
      id: 1,
      name: 'Dr. Sarah Lin',
      email: 'admin@visioniq.io',
      role: 'Admin',
      passwordHash: defaultPasswordHash,
      createdAt: new Date(now.getTime() - 14 * 86400000).toISOString()
    };

    const inspectorUser: User & { passwordHash: string } = {
      id: 2,
      name: 'Marcus Vance',
      email: 'inspector@visioniq.io',
      role: 'Inspector',
      passwordHash: defaultPasswordHash,
      createdAt: new Date(now.getTime() - 10 * 86400000).toISOString()
    };

    const viewerUser: User & { passwordHash: string } = {
      id: 3,
      name: 'Elena Rostova',
      email: 'viewer@visioniq.io',
      role: 'Viewer',
      passwordHash: defaultPasswordHash,
      createdAt: new Date(now.getTime() - 5 * 86400000).toISOString()
    };

    this.store.users = [adminUser, inspectorUser, viewerUser];
    this.nextUserId = 4;

    // Seed historical inspections
    const sampleInspections: Inspection[] = [
      {
        id: 1,
        userId: 2,
        domain: 'Industrial Manufacturing',
        mediaUrl: '/src/assets/images/inspection_industrial_weld_1793339757303.jpg',
        status: 'Completed',
        anomalyDetected: true,
        severity: 'Critical',
        confidenceScore: 98.4,
        summary: 'Micro-fissure crack along turbine junction laser weld bead with localized heat-affected zone porosity.',
        rawAiResponse: {
          anomalyDetected: true,
          severity: 'Critical',
          confidenceScore: 98.4,
          summary: 'Critical structural fracture detected along titanium alloy laser seam. Stress-riser geometry exceeds ASTM E1417 class 1 threshold.',
          detectedObjects: [
            {
              label: 'Weld Micro-Fissure',
              confidence: 98.4,
              box2d: [260, 460, 680, 520],
              severity: 'Critical',
              details: 'Crack length approx 14.2mm along vertical root pass'
            },
            {
              label: 'Heat-Affected Zone Porosity',
              confidence: 91.2,
              box2d: [200, 160, 310, 290],
              severity: 'Medium',
              details: 'Gas inclusion clustering near structural anchor points'
            }
          ],
          recommendations: [
            'Immediate containment: Quarantine assembly lot #TRB-9842 immediately',
            'Conduct high-frequency ultrasonic phased array (PAUT) confirmation',
            'Re-calibrate Nd:YAG laser focal depth and shielding argon gas flow rate'
          ],
          categoryMetrics: {
            'Crack Length': '14.2 mm',
            'Tensile Margin Deficit': '-34%',
            'Compliance Class': 'ASTM E1417 (Fail)'
          }
        },
        createdAt: new Date(now.getTime() - 3 * 86400000 + 3600000).toISOString(),
        userName: 'Marcus Vance',
        userEmail: 'inspector@visioniq.io'
      },
      {
        id: 2,
        userId: 2,
        domain: 'Infrastructure & Safety',
        mediaUrl: '/src/assets/images/inspection_infrastructure_crack_1793339758337.jpg',
        status: 'Completed',
        anomalyDetected: true,
        severity: 'High',
        confidenceScore: 96.1,
        summary: 'Deep vertical shear crack on reinforced concrete support pier with surface crack width exceeding 20mm.',
        rawAiResponse: {
          anomalyDetected: true,
          severity: 'High',
          confidenceScore: 96.1,
          summary: 'Severe longitudinal cleavage along load-bearing highway overpass column. Water intrusion and carbonation staining identified.',
          detectedObjects: [
            {
              label: 'Vertical Structural Shear Fissure',
              confidence: 96.1,
              box2d: [60, 440, 940, 560],
              severity: 'High',
              details: 'Surface separation 18mm-22mm traversing core column'
            },
            {
              label: 'Efflorescence & Corrosion Leaching',
              confidence: 88.5,
              box2d: [350, 650, 470, 700],
              severity: 'Medium',
              details: 'Rust streak indicates subsurface rebar oxidation'
            }
          ],
          recommendations: [
            'Deploy acoustic vibration monitor on pier headstock within 24 hours',
            'Apply carbon-fiber-reinforced polymer (CFRP) composite jacket wrap',
            'Restrict heavy commercial axle loads across overhead bridge span #4'
          ],
          categoryMetrics: {
            'Maximum Aperture': '22 mm',
            'Propagation Vector': 'Vertical (Axial)',
            'Structural Risk Index': 'Level 4 (Elevated)'
          }
        },
        createdAt: new Date(now.getTime() - 2 * 86400000 + 7200000).toISOString(),
        userName: 'Marcus Vance',
        userEmail: 'inspector@visioniq.io'
      },
      {
        id: 3,
        userId: 1,
        domain: 'Infrastructure & Safety',
        mediaUrl: '/src/assets/images/inspection_safety_ppe_1793339758970.jpg',
        status: 'Completed',
        anomalyDetected: false,
        severity: 'None',
        confidenceScore: 99.2,
        summary: 'Robotic assembly cell technicians fully compliant with ISO 45001 PPE regulations: hardhats, high-vis vests, eye protection, and perimeter safety barriers.',
        rawAiResponse: {
          anomalyDetected: false,
          severity: 'None',
          confidenceScore: 99.2,
          summary: '100% PPE compliance verified for all active personnel in robotic cell Unit 4. Safety interlocking fence verified intact.',
          detectedObjects: [
            {
              label: 'Compliant Worker (PPE Full Match)',
              confidence: 99.4,
              box2d: [410, 410, 970, 690],
              severity: 'None',
              details: 'ANSI Class 2 vest, Type I hardhat, safety gloves active'
            },
            {
              label: 'Compliant Robotic Perimeter Guard',
              confidence: 98.7,
              box2d: [310, 3, 850, 350],
              severity: 'None',
              details: 'Light curtain sensor beam and safety cage interlocked'
            }
          ],
          recommendations: [
            'Routine inspection passed without safety violations',
            'Maintain weekly optical sensor cleanliness checklist on interlock gates'
          ],
          categoryMetrics: {
            'PPE Compliance': '100%',
            'Personnel Count': '3 Active',
            'OSHA / ISO Standard': 'Pass'
          }
        },
        createdAt: new Date(now.getTime() - 1 * 86400000 + 10800000).toISOString(),
        userName: 'Dr. Sarah Lin',
        userEmail: 'admin@visioniq.io'
      },
      {
        id: 4,
        userId: 2,
        domain: 'Retail & Inventory',
        mediaUrl: '/src/assets/images/inspection_retail_shelf_1793339758970.jpg',
        status: 'Completed',
        anomalyDetected: true,
        severity: 'Medium',
        confidenceScore: 94.7,
        summary: 'Crushed and torn packaging anomaly detected on mid-tier shelf (Row 2, Column 4). Shelf planogram compliance 92%.',
        rawAiResponse: {
          anomalyDetected: true,
          severity: 'Medium',
          confidenceScore: 94.7,
          summary: 'Unsellable product identified: Organic Corn Flakes packaging compromised by top crease and structural side tear.',
          detectedObjects: [
            {
              label: 'Crushed Package Anomaly',
              confidence: 94.7,
              box2d: [315, 502, 510, 620],
              severity: 'Medium',
              details: 'Severe box distortion and torn top seal'
            },
            {
              label: 'Facing Misalignment',
              confidence: 86.3,
              box2d: [770, 470, 928, 550],
              severity: 'Low',
              details: 'SKU tag misaligned with barcode scanner facing'
            }
          ],
          recommendations: [
            'Dispatch floor associate to pull damaged unit #CRN-092 from shelf 2B',
            'Mark damaged unit for markdown/vendor return credit in ERP',
            'Front-face remaining inventory to restore 100% planogram compliance'
          ],
          categoryMetrics: {
            'Planogram Compliance': '91.8%',
            'Defective SKUs': '1 Item',
            'Shelf Category': 'Breakfast & Cereals'
          }
        },
        createdAt: new Date(now.getTime() - 12 * 3600000).toISOString(),
        userName: 'Marcus Vance',
        userEmail: 'inspector@visioniq.io'
      }
    ];

    this.store.inspections = sampleInspections;
    this.nextInspectionId = 5;

    // Seed audit logs
    this.store.auditLogs = [
      {
        id: 1,
        inspectionId: 1,
        action: 'AI_ANALYSIS_COMPLETED',
        details: 'Gemini Vision detected Weld Micro-Fissure (Critical) with 98.4% confidence.',
        createdAt: sampleInspections[0].createdAt
      },
      {
        id: 2,
        inspectionId: 1,
        action: 'ALERT_DISPATCHED',
        details: 'Automated containment notification sent to Plant Quality Ops.',
        createdAt: sampleInspections[0].createdAt
      },
      {
        id: 3,
        inspectionId: 2,
        action: 'AI_ANALYSIS_COMPLETED',
        details: 'Gemini Vision detected Vertical Structural Shear Fissure (High) with 96.1% confidence.',
        createdAt: sampleInspections[1].createdAt
      },
      {
        id: 4,
        inspectionId: 3,
        action: 'AI_ANALYSIS_COMPLETED',
        details: 'PPE compliance verified with 99.2% confidence. Zero anomalies detected.',
        createdAt: sampleInspections[2].createdAt
      },
      {
        id: 5,
        inspectionId: 4,
        action: 'AI_ANALYSIS_COMPLETED',
        details: 'Crushed package anomaly detected on row 2 shelf. Restocking alert logged.',
        createdAt: sampleInspections[3].createdAt
      }
    ];
    this.nextAuditLogId = 6;
  }

  // User operations
  findUserByEmail(email: string): (User & { passwordHash: string }) | undefined {
    return this.store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: number): User | undefined {
    const user = this.store.users.find((u) => u.id === id);
    if (!user) return undefined;
    const { passwordHash, ...clean } = user;
    return clean;
  }

  createUser(name: string, email: string, passwordHash: string, role: User['role'] = 'Inspector'): User {
    const user: User & { passwordHash: string } = {
      id: this.nextUserId++,
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      createdAt: new Date().toISOString()
    };
    this.store.users.push(user);
    this.save();
    const { passwordHash: _, ...clean } = user;
    return clean;
  }

  // Inspection operations
  getInspections(user: User, filters?: { domain?: string; severity?: string; anomalyDetected?: boolean; search?: string }): Inspection[] {
    let list = [...this.store.inspections];

    // RLS: Viewers & Inspectors see their own records or if Viewer see completed records, Admins see all
    if (user.role === 'Viewer') {
      // Viewers can view all completed inspection reports
      list = list.filter((i) => i.status === 'Completed');
    } else if (user.role === 'Inspector') {
      // Inspectors can view their own inspections, plus shared team inspections
      list = list.filter((i) => i.userId === user.id || i.status === 'Completed');
    }

    if (filters?.domain && filters.domain !== 'All') {
      list = list.filter((i) => i.domain.toLowerCase() === filters.domain?.toLowerCase());
    }

    if (filters?.severity && filters.severity !== 'All') {
      list = list.filter((i) => i.severity.toLowerCase() === filters.severity?.toLowerCase());
    }

    if (filters?.anomalyDetected !== undefined) {
      list = list.filter((i) => i.anomalyDetected === filters.anomalyDetected);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (i) =>
          i.summary.toLowerCase().includes(q) ||
          i.domain.toLowerCase().includes(q) ||
          i.severity.toLowerCase().includes(q) ||
          (i.userName && i.userName.toLowerCase().includes(q))
      );
    }

    // Sort descending by created_at
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getInspectionById(id: number, user: User): { inspection: Inspection; auditLogs: AuditLog[] } | null {
    const inspection = this.store.inspections.find((i) => i.id === id);
    if (!inspection) return null;

    // RLS verification
    if (user.role !== 'Admin' && inspection.userId !== user.id && user.role !== 'Viewer') {
      return null;
    }

    const logs = this.store.auditLogs
      .filter((l) => l.inspectionId === id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return { inspection, auditLogs: logs };
  }

  createInspection(data: Omit<Inspection, 'id' | 'createdAt'>): Inspection {
    const inspection: Inspection = {
      ...data,
      id: this.nextInspectionId++,
      createdAt: new Date().toISOString()
    };
    this.store.inspections.unshift(inspection);

    // Create initial audit log
    this.createAuditLog(
      inspection.id,
      'INSPECTION_CREATED',
      `Inspection submitted by ${inspection.userName || 'User #' + inspection.userId} in domain ${inspection.domain}. Status: ${inspection.status}.`
    );

    if (inspection.anomalyDetected) {
      this.createAuditLog(
        inspection.id,
        'ANOMALY_RECORDED',
        `Anomaly detected with ${inspection.severity} severity and ${inspection.confidenceScore}% confidence.`
      );
    }

    this.save();
    return inspection;
  }

  deleteInspection(id: number, user: User): boolean {
    const index = this.store.inspections.findIndex((i) => i.id === id);
    if (index === -1) return false;

    // Only Admin or author can delete
    if (user.role !== 'Admin' && this.store.inspections[index].userId !== user.id) {
      return false;
    }

    this.store.inspections.splice(index, 1);
    this.store.auditLogs = this.store.auditLogs.filter((a) => a.inspectionId !== id);
    this.save();
    return true;
  }

  createAuditLog(inspectionId: number, action: string, details: string): AuditLog {
    const log: AuditLog = {
      id: this.nextAuditLogId++,
      inspectionId,
      action,
      details,
      createdAt: new Date().toISOString()
    };
    this.store.auditLogs.push(log);
    this.save();
    return log;
  }

  getAnalyticsSummary(): AnalyticsSummary {
    const total = this.store.inspections.length;
    const anomalies = this.store.inspections.filter((i) => i.anomalyDetected).length;
    const anomalyRate = total > 0 ? Number(((anomalies / total) * 100).toFixed(1)) : 0;

    // Domain breakdown
    const domainMap: Record<string, { count: number; anomalyCount: number }> = {};
    for (const insp of this.store.inspections) {
      if (!domainMap[insp.domain]) {
        domainMap[insp.domain] = { count: 0, anomalyCount: 0 };
      }
      domainMap[insp.domain].count++;
      if (insp.anomalyDetected) {
        domainMap[insp.domain].anomalyCount++;
      }
    }
    const domainBreakdown = Object.entries(domainMap).map(([domain, data]) => ({
      domain,
      count: data.count,
      anomalyCount: data.anomalyCount
    }));

    // Severity distribution
    const severities: SeverityLevel[] = ['Critical', 'High', 'Medium', 'Low', 'None'];
    const severityDistribution = severities.map((sev) => ({
      severity: sev,
      count: this.store.inspections.filter((i) => i.severity === sev).length
    }));

    // Recent trend (last 7 days)
    const recentTrend: { date: string; count: number; anomalies: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayInspections = this.store.inspections.filter((item) => item.createdAt.startsWith(dateStr));
      recentTrend.push({
        date: dateStr,
        count: dayInspections.length,
        anomalies: dayInspections.filter((item) => item.anomalyDetected).length
      });
    }

    return {
      totalInspections: total,
      anomalyRate,
      activeCameras: 8, // Connected edge camera streams
      systemHealth: '99.98% Nominal',
      domainBreakdown,
      severityDistribution,
      recentTrend
    };
  }
}

export const db = new Database();
