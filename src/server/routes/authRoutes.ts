import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.ts';
import { registerSchema, loginSchema } from '../schemas.ts';
import { generateToken, authenticateToken, AuthenticatedRequest } from '../auth.ts';

export const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', async (req, res) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.format()
      });
      return;
    }

    const { name, email, password, role } = parseResult.data;

    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ error: 'A user with this email address already exists.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const user = db.createUser(name, email, passwordHash, role || 'Inspector');

    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.format()
      });
      return;
    }

    const { email, password } = parseResult.data;
    const userWithHash = db.findUserByEmail(email);

    if (!userWithHash) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = bcrypt.compareSync(password, userWithHash.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const { passwordHash: _, ...user } = userWithHash;
    const token = generateToken(user);

    res.json({
      message: 'Authentication successful',
      token,
      user
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// GET /api/auth/me
authRouter.get('/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

// GET /api/auth/demo-users (helpful for fast evaluation in preview)
authRouter.get('/demo-users', (_req, res) => {
  res.json({
    demoAccounts: [
      { role: 'Admin', email: 'admin@visioniq.io', name: 'Dr. Sarah Lin (Lead Architect)' },
      { role: 'Inspector', email: 'inspector@visioniq.io', name: 'Marcus Vance (Senior QA Inspector)' },
      { role: 'Viewer', email: 'viewer@visioniq.io', name: 'Elena Rostova (Compliance Auditor)' }
    ],
    defaultPassword: 'VisionIQ2026!'
  });
});
