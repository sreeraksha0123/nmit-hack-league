import { Request, Response } from 'express';
import { Role, ParticipationStatus } from '@prisma/client';
import prisma from '../prisma';

export async function getAdminStats(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== Role.ADMIN) {
      res.status(403).json({ error: 'Administrator access required.' });
      return;
    }

    const [
      totalStudents,
      totalHackathons,
      totalRegistrations,
      totalParticipants,
      recentHackathons,
      recentRegistrations,
      recentFeedback,
    ] = await Promise.all([
      // Total registered student accounts
      prisma.user.count({ where: { role: Role.STUDENT } }),
      // Total hackathons published / managed
      prisma.hackathon.count(),
      // Total registrations logged
      prisma.registration.count(),
      // Distinct or active participants
      prisma.registration.count({
        where: {
          status: {
            in: [
              ParticipationStatus.PARTICIPATED,
              ParticipationStatus.ROUND_1,
              ParticipationStatus.ROUND_2,
              ParticipationStatus.FINALIST,
              ParticipationStatus.WINNER,
            ],
          },
        },
      }),
      // Recent hackathons with registrations count
      prisma.hackathon.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { registrations: true } },
        },
      }),
      // Recent registrations
      prisma.registration.findMany({
        take: 6,
        orderBy: { registeredAt: 'desc' },
        include: {
          student: {
            select: { id: true, name: true, usn: true, department: true },
          },
          hackathon: {
            select: { id: true, title: true, organizer: true },
          },
        },
      }),
      // Recent feedback
      prisma.feedback.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          student: { select: { name: true, usn: true, department: true } },
          hackathon: { select: { title: true } },
        },
      }),
    ]);

    res.json({
      metrics: {
        totalStudents,
        totalHackathons,
        totalRegistrations,
        totalParticipants,
      },
      recentHackathons: recentHackathons.map((h) => ({
        id: h.id,
        title: h.title,
        organizer: h.organizer,
        category: h.category,
        status: h.status,
        registrationCount: h._count.registrations,
        deadline: h.registrationDeadline,
      })),
      recentRegistrations,
      recentFeedback,
    });
  } catch (error) {
    console.error('[ADMIN_GET_STATS_ERROR]', error);
    res.status(500).json({ error: 'Failed to retrieve administrative statistics.' });
  }
}

export async function getAdminStudents(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== Role.ADMIN) {
      res.status(403).json({ error: 'Administrator access required.' });
      return;
    }

    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const department = req.query.department as string;
    const batch = req.query.batch as string;

    const whereClause: any = { role: Role.STUDENT };

    if (department && department !== 'ALL') {
      whereClause.department = department;
    }

    if (batch && batch !== 'ALL') {
      whereClause.graduationYear = parseInt(batch, 10);
    }

    if (search && search.trim().length > 0) {
      whereClause.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { usn: { contains: search.trim(), mode: 'insensitive' } },
        { email: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const [total, students] = await Promise.all([
      prisma.user.count({ where: whereClause }),
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          usn: true,
          email: true,
          department: true,
          currentYear: true,
          graduationYear: true,
          gender: true,
          createdAt: true,
          _count: {
            select: { registrations: true, feedback: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    res.json({
      students: students.map((s) => ({
        ...s,
        registrationsCount: s._count.registrations,
        feedbackCount: s._count.feedback,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[ADMIN_GET_STUDENTS_ERROR]', error);
    res.status(500).json({ error: 'Failed to retrieve students list.' });
  }
}
