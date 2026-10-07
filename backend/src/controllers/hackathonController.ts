import { Request, Response } from 'express';
import { HackathonStatus, Role } from '@prisma/client';
import prisma from '../prisma';
import { HackathonUpsertSchema } from '../middleware/validation';
import { evaluateStudentEligibility } from '../services/eligibilityService';

export async function listHackathons(req: Request, res: Response): Promise<void> {
  try {
    const { category, search, eligibleOnly, status, department, batch, deadlineStatus } = req.query;
    const user = req.user;

    const whereClause: any = {};

    // By default, public & students see only PUBLISHED hackathons
    if (user?.role === Role.ADMIN && status) {
      if (status !== 'ALL') {
        whereClause.status = status as HackathonStatus;
      }
    } else {
      whereClause.status = HackathonStatus.PUBLISHED;
    }

    if (category && typeof category === 'string' && category !== 'ALL') {
      whereClause.category = { equals: category, mode: 'insensitive' };
    }

    if (deadlineStatus === 'OPEN') {
      whereClause.registrationDeadline = { gte: new Date() };
    } else if (deadlineStatus === 'CLOSED') {
      whereClause.registrationDeadline = { lt: new Date() };
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      whereClause.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { organizer: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const hackathons = await prisma.hackathon.findMany({
      where: whereClause,
      include: {
        eligibility: true,
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { registrationDeadline: 'asc' },
    });

    let filteredHackathons = hackathons;

    if (department && typeof department === 'string' && department !== 'ALL') {
      filteredHackathons = filteredHackathons.filter((h) => {
        if (!h.eligibility) return true;
        const allowed = h.eligibility.allowedDepartments;
        return allowed.length === 0 || allowed.includes(department);
      });
    }

    if (batch && typeof batch === 'string' && batch !== 'ALL') {
      const batchYear = parseInt(batch, 10);
      if (!isNaN(batchYear)) {
        filteredHackathons = filteredHackathons.filter((h) => {
          if (!h.eligibility) return true;
          const allowed = h.eligibility.allowedBatches;
          return allowed.length === 0 || allowed.includes(batchYear);
        });
      }
    }

    // If authenticated as student, attach student eligibility evaluation
    let studentProfile: any = null;
    let studentRegistrations: Set<string> = new Set();

    if (user && user.role === Role.STUDENT) {
      studentProfile = await prisma.user.findUnique({
        where: { id: user.id },
        select: { department: true, graduationYear: true, gender: true },
      });

      const userRegs = await prisma.registration.findMany({
        where: { studentId: user.id },
        select: { hackathonId: true },
      });
      studentRegistrations = new Set(userRegs.map((r) => r.hackathonId));
    }

    const formattedHackathons = filteredHackathons.map((h) => {
      let isEligible = true;
      let eligibilityReasons: string[] = [];

      if (studentProfile) {
        const evalResult = evaluateStudentEligibility(studentProfile, h.eligibility);
        isEligible = evalResult.isEligible;
        eligibilityReasons = evalResult.reasons;
      }

      return {
        ...h,
        registrationCount: h._count.registrations,
        isEligible,
        eligibilityReasons,
        isRegistered: studentRegistrations.has(h.id),
      };
    });

    // Optional filter: only show eligible
    const result =
      eligibleOnly === 'true' && user?.role === Role.STUDENT
        ? formattedHackathons.filter((h) => h.isEligible)
        : formattedHackathons;

    res.json({ hackathons: result });
  } catch (error) {
    console.error('[LIST_HACKATHONS_ERROR]', error);
    res.status(500).json({ error: 'Failed to retrieve hackathons' });
  }
}

export async function getHackathonById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = req.user;

    const hackathon = await prisma.hackathon.findUnique({
      where: { id },
      include: {
        eligibility: true,
        _count: { select: { registrations: true } },
      },
    });

    if (!hackathon) {
      res.status(404).json({ error: 'Hackathon not found' });
      return;
    }

    let isEligible = true;
    let eligibilityReasons: string[] = [];
    let existingRegistration: any = null;

    if (user && user.role === Role.STUDENT) {
      const studentProfile = await prisma.user.findUnique({
        where: { id: user.id },
        select: { department: true, graduationYear: true, gender: true },
      });

      if (studentProfile) {
        const evalResult = evaluateStudentEligibility(studentProfile, hackathon.eligibility);
        isEligible = evalResult.isEligible;
        eligibilityReasons = evalResult.reasons;
      }

      existingRegistration = await prisma.registration.findUnique({
        where: {
          studentId_hackathonId: {
            studentId: user.id,
            hackathonId: id,
          },
        },
      });
    }

    res.json({
      hackathon: {
        ...hackathon,
        registrationCount: hackathon._count.registrations,
        isEligible,
        eligibilityReasons,
        isRegistered: !!existingRegistration,
        registration: existingRegistration,
      },
    });
  } catch (error) {
    console.error('[GET_HACKATHON_ERROR]', error);
    res.status(500).json({ error: 'Failed to retrieve hackathon details' });
  }
}

export async function createHackathon(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== Role.ADMIN) {
      res.status(403).json({ error: 'Administrator access required' });
      return;
    }

    const parseResult = HackathonUpsertSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0]?.message || 'Invalid input data' });
      return;
    }

    const data = parseResult.data;

    const newHackathon = await prisma.hackathon.create({
      data: {
        title: data.title,
        organizer: data.organizer,
        description: data.description,
        category: data.category,
        registrationUrl: data.registrationUrl,
        registrationDeadline: new Date(data.registrationDeadline),
        eventDate: new Date(data.eventDate),
        teamSize: data.teamSize,
        prizeInfo: data.prizeInfo || null,
        bannerUrl: data.bannerUrl || null,
        instructions: data.instructions || null,
        createdById: req.user.id,
        eligibility: {
          create: {
            allowedDepartments: data.allowedDepartments || [],
            allowedBatches: data.allowedBatches || [],
            allowedGender: data.allowedGender,
          },
        },
      },
      include: { eligibility: true },
    });

    res.status(201).json({
      message: 'Hackathon created and published successfully',
      hackathon: newHackathon,
    });
  } catch (error) {
    console.error('[CREATE_HACKATHON_ERROR]', error);
    res.status(500).json({ error: 'Failed to create hackathon' });
  }
}

export async function updateHackathon(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== Role.ADMIN) {
      res.status(403).json({ error: 'Administrator access required' });
      return;
    }

    const { id } = req.params;
    const parseResult = HackathonUpsertSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0]?.message || 'Invalid input data' });
      return;
    }

    const data = parseResult.data;

    const updated = await prisma.hackathon.update({
      where: { id },
      data: {
        title: data.title,
        organizer: data.organizer,
        description: data.description,
        category: data.category,
        registrationUrl: data.registrationUrl,
        registrationDeadline: new Date(data.registrationDeadline),
        eventDate: new Date(data.eventDate),
        teamSize: data.teamSize,
        prizeInfo: data.prizeInfo || null,
        bannerUrl: data.bannerUrl || null,
        instructions: data.instructions || null,
        eligibility: {
          upsert: {
            create: {
              allowedDepartments: data.allowedDepartments || [],
              allowedBatches: data.allowedBatches || [],
              allowedGender: data.allowedGender,
            },
            update: {
              allowedDepartments: data.allowedDepartments || [],
              allowedBatches: data.allowedBatches || [],
              allowedGender: data.allowedGender,
            },
          },
        },
      },
      include: { eligibility: true },
    });

    res.json({ message: 'Hackathon updated successfully', hackathon: updated });
  } catch (error) {
    console.error('[UPDATE_HACKATHON_ERROR]', error);
    res.status(500).json({ error: 'Failed to update hackathon' });
  }
}

export async function archiveHackathon(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== Role.ADMIN) {
      res.status(403).json({ error: 'Administrator access required' });
      return;
    }

    const { id } = req.params;
    const updated = await prisma.hackathon.update({
      where: { id },
      data: { status: HackathonStatus.ARCHIVED },
    });

    res.json({ message: 'Hackathon archived successfully', hackathon: updated });
  } catch (error) {
    console.error('[ARCHIVE_HACKATHON_ERROR]', error);
    res.status(500).json({ error: 'Failed to archive hackathon' });
  }
}

export async function deleteHackathon(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== Role.ADMIN) {
      res.status(403).json({ error: 'Administrator access required' });
      return;
    }

    const { id } = req.params;

    // Check if registrations exist to prevent accidental historical loss
    const count = await prisma.registration.count({ where: { hackathonId: id } });
    if (count > 0) {
      res.status(400).json({
        error:
          'Cannot hard-delete hackathon with active or historical registrations. Please use Archive instead to preserve student records.',
      });
      return;
    }

    await prisma.hackathon.delete({ where: { id } });
    res.json({ message: 'Hackathon removed successfully' });
  } catch (error) {
    console.error('[DELETE_HACKATHON_ERROR]', error);
    res.status(500).json({ error: 'Failed to delete hackathon' });
  }
}
