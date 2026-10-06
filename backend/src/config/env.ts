import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@127.0.0.1:5432/nmit_hack_league?schema=public',
  
  // Mandatory College Email Domain Configuration
  COLLEGE_EMAIL_DOMAIN: (process.env.COLLEGE_EMAIL_DOMAIN || 'nmit.ac.in').trim().toLowerCase(),
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'nmit_hack_league_jwt_secret_dev_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // Administrator Initial Credentials
  ADMIN_NAME: (process.env.ADMIN_NAME || 'NMIT Hack League Admin').trim(),
  ADMIN_EMAIL: (process.env.ADMIN_EMAIL || 'admin@nmit.ac.in').trim().toLowerCase(),
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'AdminHackLeague@2026',
  ADMIN_USN: 'NMIT_ADMIN_01',

  // CORS
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = ENV.DATABASE_URL;
}

/**
 * Validates whether an email ends strictly with @${COLLEGE_EMAIL_DOMAIN}
 * Rejects subdomains, extra suffix domains, or external domains.
 * e.g. "student@nmit.ac.in" => valid
 * e.g. "student@nmit.ac.in.example.com" => invalid
 * e.g. "student@gmail.com" => invalid
 */
export function isValidCollegeEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const normalized = email.trim().toLowerCase();
  const domainPart = `@${ENV.COLLEGE_EMAIL_DOMAIN}`;
  
  // Must end strictly with domainPart and not contain further @ or domain segments
  if (!normalized.endsWith(domainPart)) return false;
  
  // Split on @ to ensure exact 2 parts [localPart, domainPartWithoutAt]
  const parts = normalized.split('@');
  if (parts.length !== 2) return false;
  
  const [localPart, domain] = parts;
  if (!localPart || localPart.length === 0) return false;
  
  return domain === ENV.COLLEGE_EMAIL_DOMAIN;
}

/**
 * Normalizes email: trim whitespace and lowercase
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Normalizes USN: trim whitespace and uppercase
 */
export function normalizeUSN(usn: string): string {
  return usn.trim().toUpperCase();
}
