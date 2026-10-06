import bcrypt from 'bcryptjs';
import {
  PrismaClient,
  Role,
  Gender,
  GenderEligibility,
  HackathonStatus,
  ParticipationStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- SEEDING NMIT HACK LEAGUE DEMO DATABASE ---');

  // Clear existing demo records safely in order of relationships
  await prisma.feedback.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.hackathonEligibility.deleteMany();
  await prisma.hackathon.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = 'Password123!';
  const salt = await bcrypt.genSalt(10);
  const commonPasswordHash = await bcrypt.hash(defaultPassword, salt);

  // 1. Seed Administrator
  const adminPasswordHash = await bcrypt.hash('AdminHackLeague@2026', salt);
  const admin = await prisma.user.create({
    data: {
      name: 'NMIT Hack League Coordinator',
      usn: 'ADMIN_NMIT_01',
      email: 'admin@nmit.ac.in',
      passwordHash: adminPasswordHash,
      department: 'ADMINISTRATION',
      currentYear: 4,
      graduationYear: 2024,
      role: Role.ADMIN,
    },
  });
  console.log('✓ Admin created:', admin.email);

  // 2. Seed Sample Students (Diverse departments, batches, genders)
  const studentData = [
    {
      name: 'Aarav Sharma',
      usn: '1NT23IS001',
      email: 'aarav.ise@nmit.ac.in',
      department: 'ISE',
      currentYear: 3,
      graduationYear: 2027,
      gender: Gender.MALE,
    },
    {
      name: 'Sree Raksha S P',
      usn: '1NT23IS089',
      email: 'sreeraksha@nmit.ac.in',
      department: 'ISE',
      currentYear: 3,
      graduationYear: 2027,
      gender: Gender.FEMALE,
    },
    {
      name: 'Kavya Raman',
      usn: '1NT22CS045',
      email: 'kavya.cs@nmit.ac.in',
      department: 'CSE',
      currentYear: 4,
      graduationYear: 2026,
      gender: Gender.FEMALE,
    },
    {
      name: 'Rohan Deshmukh',
      usn: '1NT24AI012',
      email: 'rohan.ai@nmit.ac.in',
      department: 'AIML',
      currentYear: 2,
      graduationYear: 2028,
      gender: Gender.MALE,
    },
    {
      name: 'Ananya Hegde',
      usn: '1NT23EC033',
      email: 'ananya.ec@nmit.ac.in',
      department: 'ECE',
      currentYear: 3,
      graduationYear: 2027,
      gender: Gender.FEMALE,
    },
    {
      name: 'Vikramaditya Verma',
      usn: '1NT22ME019',
      email: 'vikram.me@nmit.ac.in',
      department: 'ME',
      currentYear: 4,
      graduationYear: 2026,
      gender: Gender.MALE,
    },
  ];

  const students = [];
  for (const s of studentData) {
    const student = await prisma.user.create({
      data: {
        ...s,
        passwordHash: commonPasswordHash,
        role: Role.STUDENT,
      },
    });
    students.push(student);
  }
  console.log(`✓ ${students.length} demo students created`);

  // 3. Seed Realistic Hackathons with specific eligibility configurations
  const now = new Date();

  // Hackathon 1: Open Innovation (All depts, All batches, All genders)
  const h1 = await prisma.hackathon.create({
    data: {
      title: 'Smart India Hackathon 2026 (Internal Screening)',
      organizer: 'Ministry of Education & NMIT Innovation Cell',
      description:
        'A nationwide initiative to provide students a platform to solve pressing challenges across smart education, clean tech, disaster management, and renewable energy.',
      category: 'Open Innovation',
      registrationUrl: 'https://sih.gov.in',
      registrationDeadline: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days future
      eventDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
      teamSize: '6 Members (Min 1 Female)',
      prizeInfo: 'INR 1,00,000 Cash Pool + National Incubation Support',
      bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80',
      status: HackathonStatus.PUBLISHED,
      instructions: 'Each team must comprise strictly 6 members with at least 1 female team member. Submit ideas in official PPT format.',
      createdById: admin.id,
      eligibility: {
        create: {
          allowedDepartments: [], // Open to all
          allowedBatches: [], // Open to all
          allowedGender: GenderEligibility.ALL,
        },
      },
    },
  });

  // Hackathon 2: KPIT K-IMPACT 2.0 (ISE & CSE, 2027 Batch)
  const h2 = await prisma.hackathon.create({
    data: {
      title: 'KPIT K-IMPACT 2.0 - Mobility & AI Challenge',
      organizer: 'KPIT Technologies Ltd.',
      description:
        'Build futuristic software-defined vehicle solutions, autonomous driving edge perception models, and connected automotive architectures.',
      category: 'AI/ML & Automotive',
      registrationUrl: 'https://kpit.com/k-impact',
      registrationDeadline: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000), // 8 days future
      eventDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
      teamSize: '2-4 Members',
      prizeInfo: 'INR 3,50,000 Grand Prize + PPI Interviews',
      bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80',
      status: HackathonStatus.PUBLISHED,
      instructions: 'Participants will be provided vehicle telemetry datasets. Projects must run on Linux-based environments.',
      createdById: admin.id,
      eligibility: {
        create: {
          allowedDepartments: ['ISE', 'CSE'],
          allowedBatches: [2027],
          allowedGender: GenderEligibility.ALL,
        },
      },
    },
  });

  // Hackathon 3: Women In Tech Hack (Female Only, All Depts, 2026 & 2027 batches)
  const h3 = await prisma.hackathon.create({
    data: {
      title: 'Ada Lovelace Tech Fellowship & Hackathon',
      organizer: 'NMIT Women In Engineering (WIE)',
      description:
        'Empowering female engineers to lead transformative tech solutions across FinTech, HealthTech, and Assistive Technologies.',
      category: 'Diversity & FinTech',
      registrationUrl: 'https://nmit.ac.in/events/ada-hackathon',
      registrationDeadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      eventDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
      teamSize: '2-3 Members',
      prizeInfo: 'INR 75,000 + Corporate Mentorship with Goldmans Sachs & Microsoft',
      bannerUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&q=80',
      status: HackathonStatus.PUBLISHED,
      instructions: 'Exclusive to female students of NMIT. All branches welcome.',
      createdById: admin.id,
      eligibility: {
        create: {
          allowedDepartments: [],
          allowedBatches: [2026, 2027],
          allowedGender: GenderEligibility.FEMALE,
        },
      },
    },
  });

  // Hackathon 4: HCLTech Young Turks (Past event, allows feedback testing)
  const h4 = await prisma.hackathon.create({
    data: {
      title: 'HCLTech Young Turks Challenge 2026',
      organizer: 'HCL Technologies',
      description:
        'Enterprise cloud modernization and gen-AI workflow automation challenge for engineering undergraduates.',
      category: 'Cloud & GenAI',
      registrationUrl: 'https://hcltech.com/young-turks',
      registrationDeadline: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // Closed 10 days ago
      eventDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // Happened 2 days ago
      teamSize: '1-3 Members',
      prizeInfo: 'INR 2,00,000 + Fast-Track Job Offers',
      bannerUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80',
      status: HackathonStatus.PUBLISHED,
      instructions: 'Event completed. Post-event survey and verification in progress.',
      createdById: admin.id,
      eligibility: {
        create: {
          allowedDepartments: ['ISE', 'CSE', 'AIML', 'ECE'],
          allowedBatches: [2026, 2027],
          allowedGender: GenderEligibility.ALL,
        },
      },
    },
  });

  console.log('✓ 4 demo hackathons created with targeted eligibility rules');

  // 4. Seed Registrations & Participation Outlines
  // Aarav (ISE 2027) registered for SIH and HCLTech (Winner)
  await prisma.registration.create({
    data: {
      studentId: students[0].id,
      hackathonId: h1.id,
      status: ParticipationStatus.REGISTERED,
    },
  });

  await prisma.registration.create({
    data: {
      studentId: students[0].id,
      hackathonId: h4.id,
      status: ParticipationStatus.WINNER,
      round: 'Grand Finale - 1st Place',
      adminNotes: 'Outstanding live deployment with high jury praise.',
    },
  });

  // Sree Raksha (ISE 2027, Female) registered for KPIT (Finalist) and HCLTech
  await prisma.registration.create({
    data: {
      studentId: students[1].id,
      hackathonId: h2.id,
      status: ParticipationStatus.FINALIST,
      round: 'Prototype Evaluation Round',
      adminNotes: 'Strong telemetry optimization; selected among top 5 finalists.',
    },
  });

  await prisma.registration.create({
    data: {
      studentId: students[1].id,
      hackathonId: h4.id,
      status: ParticipationStatus.PARTICIPATED,
      round: 'Round 2',
      adminNotes: 'Submitted full source code repository.',
    },
  });

  // Kavya (CSE 2026, Female) registered for Ada Lovelace hackathon
  await prisma.registration.create({
    data: {
      studentId: students[2].id,
      hackathonId: h3.id,
      status: ParticipationStatus.ROUND_1,
      round: 'Ideation Shortlist',
      adminNotes: 'Selected for round 1 mentorship.',
    },
  });

  console.log('✓ Demo registrations and participation statuses created');

  // 5. Seed Feedback for past event
  await prisma.feedback.create({
    data: {
      studentId: students[0].id,
      hackathonId: h4.id,
      rating: 5,
      learnedText: 'Learned multi-region latency optimization and containerization on Kubernetes under high load.',
      likedText: 'The mentorship from senior HCL architects and hands-on cloud credits were fantastic.',
      improvedText: 'The preliminary submission window was slightly tight.',
      wouldParticipateAgain: true,
    },
  });

  console.log('✓ Demo feedback entries seeded');
  console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
  console.log('Admin Demo Login: admin@nmit.ac.in / AdminHackLeague@2026');
  console.log('Student Demo Login: sreeraksha@nmit.ac.in (or 1NT23IS089) / Password123!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
