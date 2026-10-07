import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';
import {
  PrismaClient,
  Role,
  Gender,
  GenderEligibility,
  HackathonStatus,
  ParticipationStatus,
} from '@prisma/client';
import { ensurePostgresRunning } from '../src/postgresService';

const prisma = new PrismaClient();

async function main() {
  console.log('--- SEEDING NMIT HACK LEAGUE DEMO DATABASE ---');
  await ensurePostgresRunning();

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

  // 3. Seed 11 Realistic Hackathons
  // 1. K-IMPACT 2.0
  const h1 = await prisma.hackathon.create({
    data: {
      title: 'K-IMPACT 2.0',
      organizer: 'KPIT Technologies',
      category: 'Innovation / Project-based Challenge',
      description:
        'A project-based innovation challenge where students work on real-world technology problems and showcase their solutions to KPIT. Focus Areas: AI Systems, Mobility / Drones, Energy, Simulation, Wearable Robotics.',
      registrationUrl: 'https://example.com/k-impact-registration',
      registrationDeadline: new Date('2026-10-30T18:29:59Z'),
      eventDate: new Date('2026-11-15T09:00:00Z'),
      teamSize: 'Max 4 members (Min 50% Female representation)',
      prizeInfo: 'PPO Opportunity + Direct Finalist Entry to KPIT Sparkle',
      bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80',
      status: HackathonStatus.PUBLISHED,
      instructions:
        'DEMO RECORD: Original NMIT announcement instructed students to coordinate with Placement Office/TPO. Team size max 4 members with at least 50% female representation. Minimum 70% throughout academic career. Maximum 3 teams from one college.',
      createdById: admin.id,
      eligibility: {
        create: {
          allowedDepartments: ['ISE', 'CSE', 'AIML', 'ECE', 'ME', 'EEE', 'CIVIL'],
          allowedBatches: [2027, 2028, 2029],
          allowedGender: GenderEligibility.ALL,
        },
      },
    },
  });

  // 2. NIRMAAN 2026
  const h2 = await prisma.hackathon.create({
    data: {
      title: 'NIRMAAN 2026',
      organizer: 'Coding Club BMSIT × Alterino Club BMSIT',
      category: 'Hardware / Deep Tech / Innovation',
      description:
        'A 24-hour national-level on-site hackathon focused on turning hardware and technology ideas into working prototypes. Challenge Areas: Hardware & Embedded Systems, Deep Tech & Edge AI, Cyber-Physical Security, Smart Mobility & Aerospace, HealthTech & Bio-Wearables, AgriTech, Open Innovation.',
      registrationUrl: 'https://nirmaan-2026-tau.vercel.app/',
      registrationDeadline: new Date('2026-09-05T18:29:59Z'),
      eventDate: new Date('2026-09-25T09:00:00Z'),
      teamSize: '3–4 members',
      prizeInfo: 'INR 1,00,000+ Prize Pool',
      bannerUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80',
      status: HackathonStatus.PUBLISHED,
      instructions:
        'Open national student hackathon. Round 1 PPT submission: 15 Aug - 5 Sep 2026. Grand Finale: 25-26 Sep 2026. Includes industry/alumni mentorship, internship opportunities, 24-hr rapid build, meals & swag kit.',
      createdById: admin.id,
      eligibility: {
        create: {
          allowedDepartments: [],
          allowedBatches: [],
          allowedGender: GenderEligibility.ALL,
        },
      },
    },
  });

  // 3. THE GREAT REWIRING 2026
  const h3 = await prisma.hackathon.create({
    data: {
      title: 'THE GREAT REWIRING 2026',
      organizer: 'The Ken',
      category: 'Corporate Case Competition / Product Building',
      description:
        'A corporate competition where students solve real-world business and product problems through strategy or technology. Tracks: Strategy Track (business problems, product thinking, AI, no coding required) and Builder Track (AI-powered solutions, product building, technology, coding). Title Partner: Zerodha.',
      registrationUrl: 'https://the-ken.com/case-competition-2026/',
      registrationDeadline: new Date('2026-09-08T18:29:59Z'),
      eventDate: new Date('2026-09-20T09:00:00Z'),
      teamSize: '1–3 students',
      prizeInfo: 'INR 20,00,000',
      bannerUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
      status: HackathonStatus.PUBLISHED,
      instructions:
        'Open to all full-time college students. Choose Strategy Track or Builder Track. National-level exposure and product/strategy experience.',
      createdById: admin.id,
      eligibility: {
        create: {
          allowedDepartments: [],
          allowedBatches: [],
          allowedGender: GenderEligibility.ALL,
        },
      },
    },
  });

  // 4. HCLTECH YOUNG TURKS '26
  const h4 = await prisma.hackathon.create({
    data: {
      title: 'HCLTECH YOUNG TURKS \'26',
      organizer: 'HCLTech + Naukri Campus',
      category: 'Skill / Aptitude / Technology Competition',
      description:
        'A national-level competition testing students through aptitude and domain-specific skill assessments across Coding, Data Science & AI, Engineering, Accounting & Finance, Sales & Marketing, and Pharma.',
      registrationUrl: 'https://www.naukri.com/campus/contests/young-turks-skills-assessment-test',
      registrationDeadline: new Date('2026-10-09T18:29:59Z'),
      eventDate: new Date('2026-10-10T09:00:00Z'),
      teamSize: 'Individual (1 member)',
      prizeInfo: 'INR 20,00,000 Pool (AIR 1: INR 1,00,000; AIR 2: INR 50k; AIR 3: INR 25k)',
      bannerUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80',
      status: HackathonStatus.PUBLISHED,
      instructions:
        'UG batches 2026-2030 and PG batches 2027-2028. Round 1: Aptitude Test (10-11 Oct 2026). Round 2: Skill Assessment (31 Oct - 1 Nov 2026). Top 50 win cash prizes and goodies.',
      createdById: admin.id,
      eligibility: {
        create: {
          allowedDepartments: [],
          allowedBatches: [2026, 2027, 2028, 2029, 2030],
          allowedGender: GenderEligibility.ALL,
        },
      },
    },
  });

  // 5. RAZORPAY AI BUILDATHON
  const h5 = await prisma.hackathon.create({
    data: {
      title: 'RAZORPAY AI BUILDATHON',
      organizer: 'Razorpay',
      category: 'AI / FinTech / Buildathon',
      description:
        'A hiring-oriented AI buildathon where projects are evaluated based on actual code and working solutions. No resume screening, no aptitude test, no group discussion. Shortlisted builders advance directly to Razorpay interview panels. Tracks: AI Growth & Agentic Commerce, AI Risk Manager, AI Revenue Recovery, AI Finance Controller, Open Track.',
      registrationUrl: 'https://razorpay.com/buildathon/',
      registrationDeadline: new Date('2026-09-05T18:29:59Z'),
      eventDate: new Date('2026-09-12T09:00:00Z'),
      teamSize: '1–4 members',
      prizeInfo: 'INR 75,000/month AI Builder Internship (6-12 Months, Bengaluru)',
      bannerUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
      status: HackathonStatus.PUBLISHED,
      instructions:
        'Pure code and prototype evaluation. Submit working GitHub repository. Direct interview access for INR 75k/month full-time AI builder internship roles in Bengaluru.',
      createdById: admin.id,
      eligibility: {
        create: {
          allowedDepartments: ['ISE', 'CSE', 'AIML', 'ECE'],
          allowedBatches: [],
          allowedGender: GenderEligibility.ALL,
        },
      },
    },
  });

  // 6. TATA IMAGINATION CHALLENGE 2026
  const h6 = await prisma.hackathon.create({
    data: {
      title: 'TATA IMAGINATION CHALLENGE 2026',
      organizer: 'Tata Group',
      category: 'Innovation / Ideation / Pitching',
      description:
        'An innovation competition focused on developing original ideas that create meaningful impact across Industry, Healthcare, Education, Sustainability, Business, and Society.',
      registrationUrl: 'https://www.tata.com/careers/programs/tata-imagination-challenge',
      registrationDeadline: new Date('2026-10-15T18:29:59Z'),
      eventDate: new Date('2026-11-17T09:00:00Z'),
      teamSize: '1–3 members',
      prizeInfo: 'Top 10: INR 2,00,000 each (Total INR 20,00,000) + Mumbai Experience',
      bannerUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
      status: HackathonStatus.PUBLISHED,
      instructions:
        'Open to all full-time undergraduate and postgraduate students across India. Rounds: 1. Tata Quiz -> 2. Gamified Challenge -> 3. Idea Pitch -> 4. Idea Defence -> Finale in Mumbai (17-19 Nov 2026). Sponsored Mumbai experience, Bombay House & Taj Palace visit, interaction with Tata and TAS leaders.',
      createdById: admin.id,
      eligibility: {
        create: {
          allowedDepartments: [],
          allowedBatches: [],
          allowedGender: GenderEligibility.ALL,
        },
      },
    },
  });

  // 7. TECHGIUM 10TH EDITION
  const h7 = await prisma.hackathon.create({
    data: {
      title: 'TECHGIUM 10TH EDITION',
      organizer: 'L&T Technology Services (LTTS)',
      category: 'Engineering Innovation',
      description:
        'An engineering innovation platform where students solve real-world industry problems and develop technical solutions across Artificial Intelligence, Cybersecurity, Digital Platforms, Manufacturing, Mobility, Energy, Sustainability, and MedTech.',
      registrationUrl: 'https://ltts.techgium.com/',
      registrationDeadline: new Date('2026-10-25T18:29:59Z'),
      eventDate: new Date('2026-11-20T09:00:00Z'),
      teamSize: '1–4 students',
      prizeInfo: '1st: INR 10,00,000 | 2nd: INR 5,00,000 | 3rd: INR 3,00,000',
      bannerUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80',
      status: HackathonStatus.PUBLISHED,
      instructions:
        'NMIT Institution Code: KARBANRITU3150. Open to 2nd year and above (2027, 2028, 2029 batches) in engineering disciplines. Stages: Concept Submission -> Technical Paper -> Virtual POC -> Grand Finale POC. Includes LTTS recruitment and internship opportunities.',
      createdById: admin.id,
      eligibility: {
        create: {
          allowedDepartments: ['ISE', 'CSE', 'AIML', 'ECE', 'ME', 'EEE', 'CIVIL'],
          allowedBatches: [2027, 2028, 2029],
          allowedGender: GenderEligibility.ALL,
        },
      },
    },
  });

  // 8. AMAZON ML CHALLENGE 2026
  const h8 = await prisma.hackathon.create({
    data: {
      title: 'AMAZON ML CHALLENGE 2026',
      organizer: 'Amazon',
      category: 'Machine Learning',
      description:
        'A 72-hour machine learning challenge where student teams work with an Amazon dataset to solve a real-world ML problem.',
      registrationUrl: 'https://unstop.com/o/z2rfsi0/',
      registrationDeadline: new Date('2026-09-20T18:29:59Z'),
      eventDate: new Date('2026-09-25T09:00:00Z'),
      teamSize: '3–4 members',
      prizeInfo: 'INR 2,25,000 Pool (1st: INR 1L, 2nd: INR 75k, 3rd: INR 50k) + PPI Opportunities',
      bannerUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&q=80',
      status: HackathonStatus.PUBLISHED,
      instructions:
        'B.E., B.Tech, M.E., M.Tech, PhD graduating batches: 2027 and 2028. Registration: 7-20 Sep 2026. 72-Hour ML Challenge: 25-27 Sep 2026. Results: 2 Oct 2026. Grand Finale: 7 Oct 2026. Top 50 teams receive PPI opportunity for Applied Scientist Intern roles; AWS credits and merchandise.',
      createdById: admin.id,
      eligibility: {
        create: {
          allowedDepartments: [],
          allowedBatches: [2027, 2028],
          allowedGender: GenderEligibility.ALL,
        },
      },
    },
  });

  // 9. BOSS CONTRIBUTOR HACKATHON 2026
  const h9 = await prisma.hackathon.create({
    data: {
      title: 'BOSS CONTRIBUTOR HACKATHON 2026',
      organizer: 'BOSS Console',
      category: 'Open Source / AI Agents',
      description:
        'An open-source contribution hackathon where participants contribute directly to the BOSS product across core workspace improvements, plugins, MCP integrations, workflows, and user experience.',
      registrationUrl: 'https://bossconsole.ai/hackathon/',
      registrationDeadline: new Date('2026-09-25T18:29:00Z'),
      eventDate: new Date('2026-09-25T18:29:00Z'),
      teamSize: 'Individual / 1–2 members',
      prizeInfo: '$1,000 Pool (1st: $500, 2nd: $300, 3rd: $200) + Internship/PPO Consideration',
      bannerUrl: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=1200&q=80',
      status: HackathonStatus.PUBLISHED,
      instructions:
        'Participants submit a public GitHub PR. AI tools are allowed. Outstanding contributors considered for pre-placement/internship opportunities.',
      createdById: admin.id,
      eligibility: {
        create: {
          allowedDepartments: [],
          allowedBatches: [],
          allowedGender: GenderEligibility.ALL,
        },
      },
    },
  });

  // 10. atomQUEST 2026
  const h10 = await prisma.hackathon.create({
    data: {
      title: 'atomQUEST 2026',
      organizer: 'Atomberg Technologies',
      category: 'Engineering / Product Prototyping',
      description:
        'An engineering challenge where students take an idea and develop it into a working prototype across Fan, Water Purifier, and Mixer Grinder tracks.',
      registrationUrl: 'https://gradpartners.in/e/AtomQuest-2026-339',
      registrationDeadline: new Date('2026-10-10T18:29:59Z'),
      eventDate: new Date('2026-10-20T09:00:00Z'),
      teamSize: '1–5 members (Cross-disciplinary encouraged)',
      prizeInfo: 'INR 2,00,000 Total Prize + Summer Internship & Full-Time PPIs',
      bannerUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&q=80',
      status: HackathonStatus.PUBLISHED,
      instructions:
        'Open to B.Tech, Dual Degree, and M.Tech engineering students. Updated registration deadline: 10 October 2026. Cross-disciplinary and cross-college teams encouraged. Opportunity for paid internships and full-time hiring.',
      createdById: admin.id,
      eligibility: {
        create: {
          allowedDepartments: ['ME', 'EEE', 'ECE', 'CSE', 'ISE', 'AIML', 'CIVIL'],
          allowedBatches: [],
          allowedGender: GenderEligibility.ALL,
        },
      },
    },
  });

  // 11. TELIPORT SEASON 4
  const h11 = await prisma.hackathon.create({
    data: {
      title: 'TELIPORT SEASON 4',
      organizer: 'Tata Elxsi',
      category: 'AI / Design / Product Engineering',
      description:
        'An AI-first design and product engineering challenge where students solve real-world problems combining design, engineering, data science and AI across Transportation, Healthcare, Media & Communications, and Energy.',
      registrationUrl: 'https://gradpartners.in/e/Tata-Elxsi-TELIPORT-Season-4-347',
      registrationDeadline: new Date('2026-10-23T18:29:00Z'),
      eventDate: new Date('2026-10-24T18:29:00Z'),
      teamSize: '2–3 members',
      prizeInfo: 'INR 4,50,000 Prize Pool + 100+ Hiring Positions (up to INR 10 LPA)',
      bannerUrl: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=1200&q=80',
      status: HackathonStatus.PUBLISHED,
      instructions:
        'Pre-final and final-year engineering students (2026 & 2027 batches; B.Tech/M.Tech/Dual Degree). Registration deadline: 23 Oct 2026, 11:59 PM IST. Round 1 submission: 24 Oct 2026, 11:59 PM IST. National finalists receive PPO opportunities; Round 2 teams receive PPIs.',
      createdById: admin.id,
      eligibility: {
        create: {
          allowedDepartments: ['ISE', 'CSE', 'AIML', 'ECE', 'ME', 'EEE'],
          allowedBatches: [2026, 2027],
          allowedGender: GenderEligibility.ALL,
        },
      },
    },
  });

  console.log('✓ 11 official hackathons created with targeted eligibility rules');

  // 4. Seed Realistic Registrations & Participation (clearly marked as DEMO DATA)
  // Aarav (ISE 2027) registered for K-IMPACT 2.0 and AMAZON ML
  await prisma.registration.create({
    data: {
      studentId: students[0].id,
      hackathonId: h1.id,
      status: ParticipationStatus.ROUND_1,
      round: 'Round 1 Concept Submission',
      adminNotes: '[DEMO DATA] Submitted AI telemetry concept proposal.',
    },
  });

  await prisma.registration.create({
    data: {
      studentId: students[0].id,
      hackathonId: h8.id,
      status: ParticipationStatus.REGISTERED,
      adminNotes: '[DEMO DATA] Intent confirmed for 72-hour challenge.',
    },
  });

  // Sree Raksha (ISE 2027, Female) registered for K-IMPACT 2.0 (Finalist) and HCLTech (Participated)
  await prisma.registration.create({
    data: {
      studentId: students[1].id,
      hackathonId: h1.id,
      status: ParticipationStatus.FINALIST,
      round: 'Grand Finale Prototype Showcase',
      adminNotes: '[DEMO DATA] Selected as top finalist for autonomous vehicle perception module.',
    },
  });

  await prisma.registration.create({
    data: {
      studentId: students[1].id,
      hackathonId: h4.id,
      status: ParticipationStatus.PARTICIPATED,
      round: 'Round 2 Skill Assessment',
      adminNotes: '[DEMO DATA] Completed domain assessment test.',
    },
  });

  // Kavya (CSE 2026) registered for TELIPORT (Round 2) and RAZORPAY AI BUILDATHON
  await prisma.registration.create({
    data: {
      studentId: students[2].id,
      hackathonId: h11.id,
      status: ParticipationStatus.ROUND_2,
      round: 'Round 2 Design Evaluation',
      adminNotes: '[DEMO DATA] Shortlisted for healthcare AI agent design.',
    },
  });

  await prisma.registration.create({
    data: {
      studentId: students[2].id,
      hackathonId: h5.id,
      status: ParticipationStatus.REGISTERED,
      adminNotes: '[DEMO DATA] Registered for agentic commerce track.',
    },
  });

  // Rohan (AIML 2028) registered for AMAZON ML and NIRMAAN 2026
  await prisma.registration.create({
    data: {
      studentId: students[3].id,
      hackathonId: h8.id,
      status: ParticipationStatus.REGISTERED,
      adminNotes: '[DEMO DATA] Team formed for ML challenge.',
    },
  });

  await prisma.registration.create({
    data: {
      studentId: students[3].id,
      hackathonId: h2.id,
      status: ParticipationStatus.PARTICIPATED,
      round: 'On-site Prototype Hack',
      adminNotes: '[DEMO DATA] Built edge AI IoT hardware prototype.',
    },
  });

  // Vikramaditya (ME 2026) registered for atomQUEST 2026
  await prisma.registration.create({
    data: {
      studentId: students[5].id,
      hackathonId: h10.id,
      status: ParticipationStatus.ROUND_1,
      round: 'Idea Pitch Phase',
      adminNotes: '[DEMO DATA] Mechanical design submission for water purifier track.',
    },
  });

  console.log('✓ Demo registrations and participation statuses created');

  // 5. Seed Feedback for past event
  await prisma.feedback.create({
    data: {
      studentId: students[1].id,
      hackathonId: h4.id,
      rating: 5,
      learnedText:
        'Gained deep exposure to enterprise aptitude patterns and timed coding problem solving under competition pressure.',
      likedText:
        'The platform assessment experience, proctoring flow, and competitive structure were well organized.',
      improvedText:
        'Would appreciate a longer gap between Round 1 aptitude announcement and Round 2 domain assessment.',
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
