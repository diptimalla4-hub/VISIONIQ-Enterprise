import { User, Inspection, AuditLog, AnalyticsSummary, SampleMediaItem, RawAIResponse } from '../types/index.ts';

const TOKEN_KEY = 'visioniq_auth_token';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeStoredToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = `Request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorData.message || errorMsg;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User; message: string }> {
    const data = await request<{ token: string; user: User; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setStoredToken(data.token);
    return data;
  },

  async register(name: string, email: string, password: string, role?: string): Promise<{ token: string; user: User; message: string }> {
    const data = await request<{ token: string; user: User; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    });
    setStoredToken(data.token);
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  async getDemoUsers(): Promise<{ demoAccounts: Array<{ role: string; email: string; name: string }>; defaultPassword: string }> {
    return request('/api/auth/demo-users');
  },

  // Inspections
  async getInspections(params?: {
    domain?: string;
    severity?: string;
    anomalyDetected?: boolean;
    search?: string;
  }): Promise<{ inspections: Inspection[] }> {
    const query = new URLSearchParams();
    if (params?.domain && params.domain !== 'All') query.set('domain', params.domain);
    if (params?.severity && params.severity !== 'All') query.set('severity', params.severity);
    if (params?.anomalyDetected !== undefined) query.set('anomalyDetected', String(params.anomalyDetected));
    if (params?.search) query.set('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<{ inspections: Inspection[] }>(`/api/inspections${queryString}`);
  },

  async getInspectionById(id: number): Promise<{ inspection: Inspection; auditLogs: AuditLog[] }> {
    return request<{ inspection: Inspection; auditLogs: AuditLog[] }>(`/api/inspections/${id}`);
  },

  async analyzeVisualAsset(payload: {
    domain: string;
    mediaBase64: string;
    mimeType: string;
    sensitivity?: 'Low' | 'Medium' | 'High';
    model?: string;
    focusAreas?: string[];
    customNotes?: string;
  }): Promise<{ inspection: Inspection; message: string }> {
    return request<{ inspection: Inspection; message: string }>('/api/inspections/analyze', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async deleteInspection(id: number): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/inspections/${id}`, {
      method: 'DELETE'
    });
  },

  // Analytics & Samples
  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    return request<AnalyticsSummary>('/api/analytics/summary');
  },

  async getSampleMedia(): Promise<{ samples: SampleMediaItem[] }> {
    return request<{ samples: SampleMediaItem[] }>('/api/sample-media');
  }
};
