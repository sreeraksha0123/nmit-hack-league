import assert from 'assert';
import { ENV } from '../src/config/env';
import app, { server } from '../src/server';

const BASE_URL = `http://127.0.0.1:${ENV.PORT}/api`;

async function waitForServer(): Promise<void> {
  console.log('Connecting to NMIT Hack League API server...');
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${ENV.PORT}/api/health`);
      if (res.ok) {
        console.log('Server is online and responding.\n');
        return;
      }
    } catch (e: any) {
      // Waiting for server boot
    }
    await new Promise((r) => setTimeout(r, 600));
  }
  throw new Error('API server failed to start within timeout');
}

async function request(path: string, options: any = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function runTests() {
  await waitForServer();

  console.log('========================================================');
  console.log('  RUNNING NMIT HACK LEAGUE COMPREHENSIVE TEST SUITE');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ ${name}`);
      console.error(`    ${err.message}`);
      failed++;
    }
  }

  // 1. Health Check
  await test('API Health Check is functional', async () => {
    const res = await request('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'ok');
  });

  // 2. Strict Email Domain Validation (Rejects Non-NMIT Email)
  await test('Rejects student signup with non-NMIT email (@gmail.com)', async () => {
    const res = await request('/auth/signup', {
      method: 'POST',
      body: {
        name: 'Attacker Student',
        usn: '1NT23IS999',
        email: 'attacker@gmail.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        department: 'ISE',
        currentYear: 3,
        graduationYear: 2027,
        gender: 'MALE',
      },
    });
    assert.strictEqual(res.status, 400);
    assert.ok(
      res.data.error.includes('@nmit.ac.in'),
      `Expected domain error message, got: ${res.data.error}`
    );
  });

  // 3. Valid Student Signup with @nmit.ac.in and Role Tamper Resistance
  const testUSN = `1NT23IS${Math.floor(100 + Math.random() * 899)}`;
  const testEmail = `test.student.${Math.floor(1000 + Math.random() * 9000)}@nmit.ac.in`;
  let studentToken = '';
  let studentId = '';

  await test('Creates student account with @nmit.ac.in and enforces STUDENT role', async () => {
    const res = await request('/auth/signup', {
      method: 'POST',
      body: {
        name: 'Pranav Kulkarni',
        usn: testUSN,
        email: testEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        department: 'ISE',
        currentYear: 3,
        graduationYear: 2027,
        gender: 'MALE',
        role: 'ADMIN', // Tamper attempt - server must ignore
      },
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.user.role, 'STUDENT', 'Role must remain STUDENT');
    assert.strictEqual(res.data.user.usn, testUSN);
    assert.strictEqual(res.data.user.passwordHash, undefined, 'passwordHash must never be exposed');
    assert.ok(res.data.token, 'JWT token must be provided');
    studentToken = res.data.token;
    studentId = res.data.user.id;
  });

  // 4. Duplicate USN Prevention
  await test('Rejects duplicate USN registration', async () => {
    const res = await request('/auth/signup', {
      method: 'POST',
      body: {
        name: 'Duplicate Student',
        usn: testUSN,
        email: `another.${Math.floor(1000 + Math.random() * 9000)}@nmit.ac.in`,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        department: 'ISE',
        currentYear: 3,
        graduationYear: 2027,
        gender: 'MALE',
      },
    });
    assert.strictEqual(res.status, 400);
    assert.ok(res.data.error.includes('USN is already registered'));
  });

  // 5. Student Login with USN
  await test('Student can log in using USN', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: {
        identifier: testUSN.toLowerCase(), // case-insensitive test
        password: 'Password123!',
      },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.user.usn, testUSN);
    assert.ok(res.data.token);
  });

  // 6. Student Login with College Email
  await test('Student can log in using College Email', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: {
        identifier: ` ${testEmail.toUpperCase()} `, // normalization test
        password: 'Password123!',
      },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.user.email, testEmail);
  });

  // 7. Admin Login
  let adminToken = '';
  await test('Admin authenticates via dedicated endpoint', async () => {
    const res = await request('/auth/admin/login', {
      method: 'POST',
      body: {
        email: ENV.ADMIN_EMAIL,
        password: ENV.ADMIN_PASSWORD,
      },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.user.role, 'ADMIN');
    assert.ok(res.data.token);
    adminToken = res.data.token;
  });

  // 8. RBAC Protection: Student Cannot Access Admin Endpoint
  await test('Student is rejected with 403 when accessing Admin API', async () => {
    const res = await request('/admin/stats', {
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.strictEqual(res.status, 403);
    assert.ok(res.data.error.includes('Administrator privileges required'));
  });

  // 9. Admin Creates Hackathon with Specific Eligibility Criteria
  let createdHackathonId = '';
  await test('Admin creates hackathon with department & batch eligibility rules', async () => {
    const res = await request('/hackathons/admin', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        title: 'NMIT AI Innovation Sprint 2026',
        organizer: 'NMIT IEEE Student Branch',
        description: '24-hour campus hackathon solving multi-agent robotics and vision problems.',
        category: 'AI/ML',
        registrationUrl: 'https://ieee.nmit.ac.in/ai-sprint',
        registrationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        teamSize: '2-4 Members',
        prizeInfo: 'INR 50,000 Cash Pool',
        allowedDepartments: ['ISE', 'CSE'],
        allowedBatches: [2027],
        allowedGender: 'ALL',
      },
    });
    assert.strictEqual(res.status, 201);
    assert.ok(res.data.hackathon.id);
    assert.deepStrictEqual(res.data.hackathon.eligibility.allowedDepartments, ['ISE', 'CSE']);
    createdHackathonId = res.data.hackathon.id;
  });

  // 10. Eligibility Engine Evaluation
  await test('Evaluates student eligibility for the created hackathon', async () => {
    const res = await request(`/hackathons/${createdHackathonId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.strictEqual(res.status, 200);
    // Student is ISE and 2027 batch -> must be eligible
    assert.strictEqual(res.data.hackathon.isEligible, true);
  });

  // 11. Student Registration Flow & External Redirect Payload
  await test('Student registers intent and receives external URL payload', async () => {
    const res = await request(`/hackathons/${createdHackathonId}/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.alreadyRegistered, false);
    assert.strictEqual(res.data.registrationUrl, 'https://ieee.nmit.ac.in/ai-sprint');
    assert.ok(res.data.message.includes('NMIT Hack League'));
  });

  // 12. Duplicate Registration Prevention
  await test('Subsequent registration attempt returns existing registration without creating duplicate', async () => {
    const res = await request(`/hackathons/${createdHackathonId}/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.alreadyRegistered, true);
    assert.ok(res.data.message.includes('already registered'));
    assert.strictEqual(res.data.registrationUrl, 'https://ieee.nmit.ac.in/ai-sprint');
  });

  // 13. Ineligible Student Registration Gatekeeping
  await test('Ineligible student is rejected from registering with 403 Forbidden', async () => {
    // Signup student with department 'ME'
    const meUSN = `1NT23ME${Math.floor(100 + Math.random() * 899)}`;
    const meEmail = `me.student.${Math.floor(1000 + Math.random() * 9000)}@nmit.ac.in`;
    const signupRes = await request('/auth/signup', {
      method: 'POST',
      body: {
        name: 'Mechanical Student',
        usn: meUSN,
        email: meEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        department: 'ME', // Ineligible for this ISE/CSE hackathon
        currentYear: 3,
        graduationYear: 2027,
        gender: 'MALE',
      },
    });
    const meToken = signupRes.data.token;

    const regRes = await request(`/hackathons/${createdHackathonId}/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${meToken}` },
    });
    assert.strictEqual(regRes.status, 403);
    assert.ok(regRes.data.error.includes('not eligible'));
  });

  // 14. Admin Updates Student Participation Status
  let regRecordId = '';
  await test('Admin retrieves hackathon registrations and updates status to FINALIST', async () => {
    const listRes = await request(`/admin/hackathons/${createdHackathonId}/registrations`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(listRes.status, 200);
    assert.ok(listRes.data.registrations.length >= 1);
    regRecordId = listRes.data.registrations[0].id;

    const updateRes = await request(`/admin/participation/${regRecordId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        status: 'FINALIST',
        round: 'Prototype Pitch Round',
        adminNotes: 'Selected in top 3 teams for the grand showcase.',
      },
    });
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.data.registration.status, 'FINALIST');
    assert.strictEqual(updateRes.data.registration.round, 'Prototype Pitch Round');
  });

  // 15. Student Sees Updated Status in My Hackathons
  await test('Student sees updated FINALIST status in My Hackathons', async () => {
    const res = await request('/students/me/registrations', {
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.strictEqual(res.status, 200);
    const item = res.data.registrations.find((r: any) => r.hackathonId === createdHackathonId);
    assert.ok(item, 'Registration must be present');
    assert.strictEqual(item.status, 'FINALIST');
    assert.strictEqual(item.round, 'Prototype Pitch Round');
  });

  // 16. Student Submits Feedback for Qualified Hackathon
  await test('Student submits post-hackathon feedback', async () => {
    const res = await request(`/hackathons/${createdHackathonId}/feedback`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        rating: 5,
        learnedText: 'Learned distributed ROS2 navigation and stereo vision pipeline optimization.',
        likedText: 'The hardware test tracks and mentor support were phenomenal.',
        improvedText: 'Could use more power outlets at team stations.',
        wouldParticipateAgain: true,
      },
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.feedback.rating, 5);
  });

  // 17. Duplicate Feedback Prevention
  await test('Rejects duplicate feedback submission for the same student + hackathon', async () => {
    const res = await request(`/hackathons/${createdHackathonId}/feedback`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        rating: 4,
        learnedText: 'Duplicate submission attempt',
        likedText: 'Duplicate liked',
        improvedText: 'Duplicate improvement',
        wouldParticipateAgain: true,
      },
    });
    assert.strictEqual(res.status, 400);
    assert.ok(res.data.error.includes('already submitted feedback'));
  });

  // 18. Admin Reviews Feedback
  await test('Admin reviews feedback in administrative logs', async () => {
    const res = await request(`/admin/feedback?hackathonId=${createdHackathonId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.feedback.length >= 1);
    assert.strictEqual(res.data.feedback[0].rating, 5);
  });

  // 19. Admin Statistics Endpoint
  await test('Admin statistics reflects total counts and recent activity', async () => {
    const res = await request('/admin/stats', {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.metrics.totalStudents >= 7);
    assert.ok(res.data.metrics.totalHackathons >= 5);
    assert.ok(res.data.metrics.totalRegistrations >= 5);
    assert.ok(res.data.metrics.totalParticipants >= 4);
  });

  // 20. Admin Student Directory
  await test('Admin student directory returns paginated records without exposing passwords', async () => {
    const res = await request('/admin/students?page=1&limit=5', {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.students.length > 0);
    assert.strictEqual(res.data.students[0].passwordHash, undefined);
  });

  console.log('\n========================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================\n');

  server.close(() => {
    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  });
}

runTests();
