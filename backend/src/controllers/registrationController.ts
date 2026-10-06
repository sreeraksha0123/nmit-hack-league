import { Request, Response } from 'express';
import { HackathonStatus, ParticipationStatus, Role } from '@prisma/client';
import prisma from '../prisma';
import { evaluateStudentEligibility } from '../services/eligibilityService';

export async function registerForHackathon(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== Role.STUDENT) {
      res.status(401).json({ error: 'Student authentication required.' });
      return;
    }

    const { id: hackathonId } = req.params;
    const studentId = req.user.id;

    // 1. Verify Hackathon existence and status
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      include: { eligibility: true },
    });

    if (!hackathon) {
      res.status(404).json({ error: 'Hackathon not found.' });
      return;
    }

    if (hackathon.status !== HackathonStatus.PUBLISHED) {
      res.status(400).json({ error: 'This opportunity is not currently open for registrations.' });
      return;
    }

    // 2. Server-side deadline check (uses server time)
    const now = new Date();
    if (new Date(hackathon.registrationDeadline) < now) {
      res.status(400).json({
        error: 'Registration has closed for this hackathon (deadline passed).',
      });
      return;
    }

    // 3. Fetch student profile and evaluate eligibility
    const student = await prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      res.status(404).json({ error: 'Student record not found.' });
      return;
    }

    const evalResult = evaluateStudentEligibility(student, hackathon.eligibility);
    if (!evalResult.isEligible) {
      res.status(403).json({
        error: 'You are not eligible for this hackathon.',
        reasons: evalResult.reasons,
      });
      return;
    }

    // 4. Duplicate Check: Return existing registration safely without duplicating
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        studentId_hackathonId: {
          studentId,
          hackathonId,
        },
      },
    });

    if (existingRegistration) {
      res.json({
        alreadyRegistered: true,
        message: 'You have already registered for this opportunity.',
        registrationUrl: hackathon.registrationUrl,
        registration: existingRegistration,
      });
      return;
    }

    // 5. Create new Registration transactionally
    const newRegistration = await prisma.registration.create({
      data: {
        studentId,
        hackathonId,
        status: ParticipationStatus.REGISTERED,
      },
    });

    res.status(201).json({
      success: true,
      alreadyRegistered: false,
      message:
        'Your participation has been recorded by NMIT Hack League. Please complete registration on the official organizer website.',
      registrationUrl: hackathon.registrationUrl,
      registration: newRegistration,
    });
  } catch (error) {
    console.error('[REGISTER_HACKATHON_ERROR]', error);
    res.status(500).json({ error: 'An unexpected error occurred while processing registration.' });
  }
}

export async function getMyRegistrations(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== Role.STUDENT) {
      res.status(401).json({ error: 'Student authentication required.' });
      return;
    }

    const registrations = await prisma.registration.findMany({
      where: { studentId: req.user.id },
      include: {
        hackathon: {
          select: {
            id: true,
            title: true,
            organizer: true,
            category: true,
            eventDate: true,
            registrationDeadline: true,
            registrationUrl: true,
            bannerUrl: true,
            status: true,
          },
        },
      },
      orderBy: { registeredAt: 'desc' },
    });

    // Check feedback status for each registration
    const feedbackList = await prisma.feedback.findMany({
      where: { studentId: req.user.id },
      select: { hackathonId: true, rating: true },
    });
    const feedbackMap = new Map(feedbackList.map((f) => [f.hackathonId, f]));

    const results = registrations.map((r) => ({
      ...r,
      hasSubmittedFeedback: feedbackMap.has(r.hackathonId),
      submittedFeedback: feedbackMap.get(r.hackathonId) || null,
    }));

    res.json({ registrations: results });
  } catch (error) {
    console.error('[GET_MY_REGISTRATIONS_ERROR]', error);
    res.status(500).json({ error: 'Failed to retrieve registrations.' });
  }
}

export async function getAdminHackathonRegistrations(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== Role.ADMIN) {
      res.status(403).json({ error: 'Administrator access required.' });
      return;
    }

    const { id: hackathonId } = req.params;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const whereClause: any = { hackathonId };

    if (status && status !== 'ALL') {
      whereClause.status = status as ParticipationStatus;
    }

    if (search && search.trim().length > 0) {
      whereClause.student = {
        OR: [
          { name: { contains: search.trim(), mode: 'insensitive' } },
          { usn: { contains: search.trim(), mode: 'insensitive' } },
          { email: { contains: search.trim(), mode: 'insensitive' } },
        ],
      };
    }

    const [total, registrations, hackathon] = await Promise.all([
      prisma.registration.count({ where: whereClause }),
      prisma.registration.findMany({
        where: whereClause,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              usn: true,
              email: true,
              department: true,
              currentYear: true,
              graduationYear: true,
              gender: true,
            },
          },
        },
        orderBy: { registeredAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.hackathon.findUnique({
        where: { id: hackathonId },
        select: { id: true, title: true, organizer: true, status: true },
      }),
    ]);

    res.json({
      hackathon,
      registrations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[ADMIN_GET_REGISTRATIONS_ERROR]', error);
    res.status(500).json({ error: 'Failed to retrieve registration records.' });
  }
}
