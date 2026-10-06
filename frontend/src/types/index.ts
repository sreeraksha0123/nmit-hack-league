export type Role = 'STUDENT' | 'ADMIN';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type GenderEligibility = 'ALL' | 'MALE' | 'FEMALE';
export type HackathonStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type ParticipationStatus =
  | 'REGISTERED'
  | 'PARTICIPATED'
  | 'ROUND_1'
  | 'ROUND_2'
  | 'FINALIST'
  | 'WINNER'
  | 'DID_NOT_PARTICIPATE'
  | 'DISQUALIFIED';

export interface User {
  id: string;
  name: string;
  usn: string;
  email: string;
  department?: string;
  currentYear?: number;
  graduationYear?: number;
  gender?: Gender;
  role: Role;
  createdAt: string;
}

export interface HackathonEligibility {
  id: string;
  hackathonId: string;
  allowedDepartments: string[];
  allowedBatches: number[];
  allowedGender: GenderEligibility;
}

export interface Hackathon {
  id: string;
  title: string;
  organizer: string;
  description: string;
  category: string;
  registrationUrl: string;
  registrationDeadline: string;
  eventDate: string;
  teamSize: string;
  prizeInfo?: string | null;
  bannerUrl?: string | null;
  status: HackathonStatus;
  instructions?: string | null;
  createdById: string;
  createdAt: string;
  eligibility?: HackathonEligibility | null;
  registrationCount?: number;
  isEligible?: boolean;
  eligibilityReasons?: string[];
  isRegistered?: boolean;
}

export interface Registration {
  id: string;
  studentId: string;
  hackathonId: string;
  status: ParticipationStatus;
  round?: string | null;
  adminNotes?: string | null;
  registeredAt: string;
  updatedAt: string;
  student?: User;
  hackathon?: Hackathon;
  hasSubmittedFeedback?: boolean;
  submittedFeedback?: Feedback | null;
}

export interface Feedback {
  id: string;
  studentId: string;
  hackathonId: string;
  rating: number;
  learnedText: string;
  likedText: string;
  improvedText: string;
  wouldParticipateAgain: boolean;
  createdAt: string;
  student?: User;
  hackathon?: Hackathon;
}

export interface AdminStats {
  metrics: {
    totalStudents: number;
    totalHackathons: number;
    totalRegistrations: number;
    totalParticipants: number;
  };
  recentHackathons: Array<{
    id: string;
    title: string;
    organizer: string;
    category: string;
    status: HackathonStatus;
    registrationCount: number;
    deadline: string;
  }>;
  recentRegistrations: Registration[];
  recentFeedback: Feedback[];
}

// Centralized Participation Status Metadata
export const PARTICIPATION_STATUS_MAP: Record<
  ParticipationStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  REGISTERED: {
    label: 'Registered',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
    dot: 'bg-blue-400',
  },
  PARTICIPATED: {
    label: 'Participated',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/20',
    dot: 'bg-indigo-400',
  },
  ROUND_1: {
    label: 'Round 1 Cleared',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/20',
    dot: 'bg-cyan-400',
  },
  ROUND_2: {
    label: 'Round 2 Cleared',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/20',
    dot: 'bg-purple-400',
  },
  FINALIST: {
    label: 'Finalist',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    dot: 'bg-amber-400',
  },
  WINNER: {
    label: 'Winner 🏆',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  DID_NOT_PARTICIPATE: {
    label: 'Did Not Participate',
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/20',
    dot: 'bg-slate-400',
  },
  DISQUALIFIED: {
    label: 'Disqualified',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/20',
    dot: 'bg-rose-400',
  },
};
