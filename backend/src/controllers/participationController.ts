import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import prisma from '../prisma';
import { UpdateParticipationSchema } from '../middleware/validation';

export async function updateParticipationStatus(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== Role.ADMIN) {
      res.status(403).json({ error: 'Administrator access required.' });
      return;
    }

    const { id: registrationId } = req.params;
    const parseResult = UpdateParticipationSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0]?.message || 'Invalid input data' });
      return;
    }

    const { status, round, adminNotes } = parseResult.data;

    const existing = await prisma.registration.findUnique({
      where: { id: registrationId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Registration record not found.' });
      return;
    }

    const updated = await prisma.registration.update({
      where: { id: registrationId },
      data: {
        status: status as any,
        round: round !== undefined ? round : existing.round,
        adminNotes: adminNotes !== undefined ? adminNotes : existing.adminNotes,
      },
      include: {
        student: {
          select: { id: true, name: true, usn: true, email: true, department: true },
        },
        hackathon: {
          select: { id: true, title: true },
        },
      },
    });

    res.json({
      message: 'Participation status updated successfully.',
      registration: updated,
    });
  } catch (error) {
    console.error('[UPDATE_PARTICIPATION_ERROR]', error);
    res.status(500).json({ error: 'Failed to update participation status.' });
  }
}
