import { Request, Response } from 'express';
import { ParticipationStatus, Role } from '@prisma/client';
import prisma from '../prisma';
import { FeedbackSubmissionSchema } from '../middleware/validation';

const QUALIFIED_PARTICIPATION_STATUSES = new Set<ParticipationStatus>([
  ParticipationStatus.PARTICIPATED,
  ParticipationStatus.ROUND_1,
  ParticipationStatus.ROUND_2,
  ParticipationStatus.FINALIST,
  ParticipationStatus.WINNER,
]);

export async function submitFeedback(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== Role.STUDENT) {
      res.status(401).json({ error: 'Student authentication required.' });
      return;
    }

    const { id: hackathonId } = req.params;
    const studentId = req.user.id;

    const parseResult = FeedbackSubmissionSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0]?.message || 'Invalid feedback data' });
      return;
    }

    // 1. Verify student is registered for this hackathon
    const registration = await prisma.registration.findUnique({
      where: {
        studentId_hackathonId: {
          studentId,
          hackathonId,
        },
      },
      include: {
        hackathon: true,
      },
    });

    if (!registration) {
      res.status(403).json({
        error: 'You must be registered for this hackathon to submit feedback.',
      });
      return;
    }

    // 2. Enforce feedback eligibility:
    // Event date has passed OR admin marked student with a qualified participation status
    const isEventPassed = new Date(registration.hackathon.eventDate) <= new Date();
    const isStatusQualified = QUALIFIED_PARTICIPATION_STATUSES.has(registration.status);

    if (!isEventPassed && !isStatusQualified) {
      res.status(400).json({
        error:
          'Feedback can only be submitted after the event date has passed, or once participation has been verified by the coordinator.',
      });
      return;
    }

    // 3. Check for existing feedback (prevent duplicates)
    const existingFeedback = await prisma.feedback.findUnique({
      where: {
        studentId_hackathonId: {
          studentId,
          hackathonId,
        },
      },
    });

    if (existingFeedback) {
      res.status(400).json({
        error: 'You have already submitted feedback for this hackathon.',
      });
      return;
    }

    // 4. Create Feedback record
    const { rating, learnedText, likedText, improvedText, wouldParticipateAgain } = parseResult.data;
    const newFeedback = await prisma.feedback.create({
      data: {
        studentId,
        hackathonId,
        rating,
        learnedText,
        likedText,
        improvedText,
        wouldParticipateAgain,
      },
    });

    res.status(201).json({
      message: 'Thank you! Your feedback has been recorded successfully.',
      feedback: newFeedback,
    });
  } catch (error) {
    console.error('[SUBMIT_FEEDBACK_ERROR]', error);
    res.status(500).json({ error: 'Failed to record feedback.' });
  }
}

export async function getAdminFeedback(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== Role.ADMIN) {
      res.status(403).json({ error: 'Administrator access required.' });
      return;
    }

    const { hackathonId, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = {};
    if (hackathonId && typeof hackathonId === 'string' && hackathonId !== 'ALL') {
      whereClause.hackathonId = hackathonId;
    }

    const [total, feedbackList] = await Promise.all([
      prisma.feedback.count({ where: whereClause }),
      prisma.feedback.findMany({
        where: whereClause,
        include: {
          student: {
            select: { id: true, name: true, usn: true, department: true },
          },
          hackathon: {
            select: { id: true, title: true, organizer: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    res.json({
      feedback: feedbackList,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('[GET_ADMIN_FEEDBACK_ERROR]', error);
    res.status(500).json({ error: 'Failed to retrieve feedback list.' });
  }
}
