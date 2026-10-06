import { z } from 'zod';
import { Gender, GenderEligibility } from '@prisma/client';
import { isValidCollegeEmail, normalizeEmail, normalizeUSN, ENV } from '../config/env';

export const StudentSignupSchema = z
  .object({
    name: z.string().min(2, 'Full Name must be at least 2 characters').trim(),
    usn: z
      .string()
      .min(3, 'USN is required')
      .transform(normalizeUSN),
    email: z
      .string()
      .email('Please provide a valid email format')
      .transform(normalizeEmail)
      .refine(
        (val) => isValidCollegeEmail(val),
        `Only NMIT college email addresses ending with @${ENV.COLLEGE_EMAIL_DOMAIN} are allowed.`
      ),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password is required'),
    department: z.string().min(2, 'Department is required').trim().toUpperCase(),
    currentYear: z.coerce.number().int().min(1).max(4, 'Current year must be between 1 and 4'),
    graduationYear: z.coerce.number().int().min(2024).max(2032, 'Graduation year must be valid'),
    gender: z.nativeEnum(Gender, {
      errorMap: () => ({ message: 'Gender must be MALE, FEMALE, or OTHER' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const StudentLoginSchema = z.object({
  identifier: z.string().min(2, 'Email or USN is required').trim(),
  password: z.string().min(1, 'Password is required'),
});

export const AdminLoginSchema = z.object({
  email: z.string().email('Valid email is required').transform(normalizeEmail),
  password: z.string().min(1, 'Password is required'),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).trim().optional(),
  department: z.string().min(2).trim().toUpperCase().optional(),
  currentYear: z.coerce.number().int().min(1).max(4).optional(),
  graduationYear: z.coerce.number().int().min(2024).max(2032).optional(),
  gender: z.nativeEnum(Gender).optional(),
});

export const HackathonUpsertSchema = z.object({
  title: z.string().min(3, 'Title is required').trim(),
  organizer: z.string().min(2, 'Organizer is required').trim(),
  description: z.string().min(10, 'Description must be at least 10 characters').trim(),
  category: z.string().min(2, 'Category is required').trim(),
  registrationUrl: z.string().url('A valid registration URL is required'),
  registrationDeadline: z.string().refine((val) => !isNaN(Date.parse(val)), 'Valid deadline date required'),
  eventDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Valid event date required'),
  teamSize: z.string().min(1, 'Team size is required').trim(),
  prizeInfo: z.string().optional().nullable(),
  bannerUrl: z.string().url().optional().nullable().or(z.literal('')),
  instructions: z.string().optional().nullable(),
  // Eligibility criteria
  allowedDepartments: z.array(z.string()).optional().default([]),
  allowedBatches: z.array(z.coerce.number().int()).optional().default([]),
  allowedGender: z.nativeEnum(GenderEligibility).optional().default(GenderEligibility.ALL),
});

export const UpdateParticipationSchema = z.object({
  status: z.enum([
    'REGISTERED',
    'PARTICIPATED',
    'ROUND_1',
    'ROUND_2',
    'FINALIST',
    'WINNER',
    'DID_NOT_PARTICIPATE',
    'DISQUALIFIED',
  ]),
  round: z.string().optional().nullable(),
  adminNotes: z.string().optional().nullable(),
});

export const FeedbackSubmissionSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  learnedText: z.string().min(5, 'Please share what you learned').trim(),
  likedText: z.string().min(5, 'Please share what you liked').trim(),
  improvedText: z.string().min(5, 'Please share what could be improved').trim(),
  wouldParticipateAgain: z.boolean().default(true),
});
