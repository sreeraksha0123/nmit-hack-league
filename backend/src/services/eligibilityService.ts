import { Gender, GenderEligibility, HackathonEligibility, User } from '@prisma/client';

export interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
}

export function evaluateStudentEligibility(
  student: Pick<User, 'department' | 'graduationYear' | 'gender'>,
  eligibility: Pick<HackathonEligibility, 'allowedDepartments' | 'allowedBatches' | 'allowedGender'> | null
): EligibilityResult {
  // If no eligibility rules are defined, open to all
  if (!eligibility) {
    return { isEligible: true, reasons: [] };
  }

  const reasons: string[] = [];

  // 1. Department Check: Empty means open to all departments
  if (eligibility.allowedDepartments && eligibility.allowedDepartments.length > 0) {
    const studentDept = (student.department || '').trim().toUpperCase();
    const allowedDeptsUpper = eligibility.allowedDepartments.map((d) => d.trim().toUpperCase());
    
    // Check if "ALL" is in the allowed list or student dept is present
    const isDeptAllowed = allowedDeptsUpper.includes('ALL') || allowedDeptsUpper.includes(studentDept);
    if (!isDeptAllowed) {
      reasons.push(
        `Department restricted to [${eligibility.allowedDepartments.join(', ')}]. Your department: ${studentDept || 'Not specified'}.`
      );
    }
  }

  // 2. Batch / Graduation Year Check: Empty means open to all batches
  if (eligibility.allowedBatches && eligibility.allowedBatches.length > 0) {
    const studentBatch = student.graduationYear;
    if (!studentBatch || !eligibility.allowedBatches.includes(studentBatch)) {
      reasons.push(
        `Batch restricted to [${eligibility.allowedBatches.join(', ')}]. Your graduation year: ${studentBatch || 'Not specified'}.`
      );
    }
  }

  // 3. Gender Check: ALL means every gender is eligible
  if (eligibility.allowedGender && eligibility.allowedGender !== GenderEligibility.ALL) {
    const targetGender = eligibility.allowedGender === GenderEligibility.MALE ? Gender.MALE : Gender.FEMALE;
    if (student.gender !== targetGender) {
      reasons.push(
        `Gender criteria: ${eligibility.allowedGender}. Your profile specifies: ${student.gender || 'Not specified'}.`
      );
    }
  }

  return {
    isEligible: reasons.length === 0,
    reasons,
  };
}
