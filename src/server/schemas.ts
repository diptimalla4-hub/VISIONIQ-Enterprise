import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Admin', 'Inspector', 'Viewer']).optional().default('Inspector')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const inspectionInputSchema = z.object({
  domain: z.string().min(2, 'Domain is required'),
  mediaBase64: z.string().min(1, 'Media payload is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
  sensitivity: z.enum(['Low', 'Medium', 'High']).optional().default('Medium'),
  model: z.string().optional(),
  focusAreas: z.array(z.string()).optional(),
  customNotes: z.string().optional()
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type InspectionInput = z.infer<typeof inspectionInputSchema>;
