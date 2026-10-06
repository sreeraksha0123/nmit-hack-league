import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import prisma from '../prisma';
import { ENV } from '../config/env';

export async function initializeAdminAccount(): Promise<void> {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { email: ENV.ADMIN_EMAIL },
          { role: Role.ADMIN },
        ],
      },
    });

    if (existingAdmin) {
      // Admin account already exists; do not recreate
      return;
    }

    // Securely hash the administrator password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(ENV.ADMIN_PASSWORD, salt);

    await prisma.user.create({
      data: {
        name: ENV.ADMIN_NAME,
        usn: ENV.ADMIN_USN,
        email: ENV.ADMIN_EMAIL,
        passwordHash,
        role: Role.ADMIN,
        department: 'ADMINISTRATION',
        currentYear: 4,
        graduationYear: 2024,
      },
    });

    console.log(`[AUTH] Administrator account initialized successfully (${ENV.ADMIN_EMAIL})`);
  } catch (error) {
    console.error('[AUTH] Error initializing administrator account:', error);
  }
}
