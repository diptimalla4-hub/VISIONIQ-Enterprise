export type UserRole = 'Admin' | 'Inspector' | 'Viewer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export type SeverityLevel = 'None' | 'Low' | 'Medium' | 'High' | 'Critical';
export type InspectionStatus = 'Pending' | 'Processing' | 'Completed' | 'Failed';

export interface DetectedObject {
  label: string;
  confidence: number;
  box2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] in normalized 0-1000 scale
  severity?: SeverityLevel;
  details?: string;
}

export interface RawAIResponse {
  anomalyDetected: boolean;
  severity: SeverityLevel;
  confidenceScore: number;
  summary: string;
  detectedObjects: DetectedObject[];
  recommendations: string[];
  categoryMetrics?: Record<string, string | number>;
}

export interface Inspection {
  id: number;
  userId: number;
  domain: string;
  mediaUrl: string;
  status: InspectionStatus;
  anomalyDetected: boolean;
  severity: SeverityLevel;
  confidenceScore: number;
  summary: string;
  rawAiResponse: RawAIResponse;
  createdAt: string;
  userName?: string;
  userEmail?: string;
}

export interface AuditLog {
  id: number;
  inspectionId: number;
  action: string;
  details: string;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalInspections: number;
  anomalyRate: number;
  activeCameras: number;
  systemHealth: string;
  domainBreakdown: {
    domain: string;
    count: number;
    anomalyCount: number;
  }[];
  severityDistribution: {
    severity: SeverityLevel;
    count: number;
  }[];
  recentTrend: {
    date: string;
    count: number;
    anomalies: number;
  }[];
}

export interface InspectionProfile {
  id: string;
  name: string;
  domain: string;
  sensitivity: 'Low' | 'Medium' | 'High';
  focusAreas: string[];
  description: string;
}

export interface SampleMediaItem {
  id: string;
  title: string;
  domain: string;
  description: string;
  imageUrl: string;
  expectedAnomaly: string;
  recommendedProfile: string;
}
