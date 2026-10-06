import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import prisma from '../prisma';
import { ENV, normalizeEmail, normalizeUSN } from '../config/env';
import {
  StudentSignupSchema,
  StudentLoginSchema,
  AdminLoginSchema,
  UpdateProfileSchema,
} from '../middleware/validation';

export async function studentSignup(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = StudentSignupSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: parseResult.error.errors[0]?.message || 'Invalid input data',
      });
      return;
    }

    const { name, usn, email, password, department, currentYear, graduationYear, gender } =
      parseResult.data;

    // Verify USN uniqueness
    const existingUSN = await prisma.user.findUnique({
      where: { usn },
    });
    if (existingUSN) {
      res.status(400).json({ error: 'USN is already registered. Please log in.' });
      return;
    }

    // Verify Email uniqueness
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      res.status(400).json({ error: 'College email is already registered. Please log in.' });
      return;
    }

    // Hash password securely
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // CRITICAL: Force role to STUDENT regardless of what client sent
    const newStudent = await prisma.user.create({
      data: {
        name,
        usn,
        email,
        passwordHash,
        department,
        currentYear,
        graduationYear,
        gender,
        role: Role.STUDENT,
      },
      select: {
        id: true,
        name: true,
        usn: true,
        email: true,
        department: true,
        currentYear: true,
        graduationYear: true,
        gender: true,
        role: true,
        createdAt: true,
      },
    });

    const token = jwt.sign(
      {
        id: newStudent.id,
        email: newStudent.email,
        usn: newStudent.usn,
        role: newStudent.role,
        name: newStudent.name,
      },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN as any }
    );

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: newStudent,
    });
  } catch (error) {
    console.error('[AUTH_SIGNUP_ERROR]', error);
    res.status(500).json({ error: 'An unexpected error occurred during signup. Please try again.' });
  }
}

export async function studentLogin(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = StudentLoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0]?.message || 'Invalid credentials' });
      return;
    }

    const { identifier, password } = parseResult.data;
    const isEmail = identifier.includes('@');
    const normalizedIdentifier = isEmail ? normalizeEmail(identifier) : normalizeUSN(identifier);

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedIdentifier }, { usn: normalizedIdentifier }],
        role: Role.STUDENT,
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials. Please verify your Email/USN and password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials. Please verify your Email/USN and password.' });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        usn: user.usn,
        role: user.role,
        name: user.name,
      },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN as any }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        usn: user.usn,
        email: user.email,
        department: user.department,
        currentYear: user.currentYear,
        graduationYear: user.graduationYear,
        gender: user.gender,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[STUDENT_LOGIN_ERROR]', error);
    res.status(500).json({ error: 'An unexpected error occurred during login.' });
  }
}

export async function adminLogin(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = AdminLoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0]?.message || 'Invalid credentials' });
      return;
    }

    const { email, password } = parseResult.data;

    const admin = await prisma.user.findFirst({
      where: {
        email,
        role: Role.ADMIN,
      },
    });

    if (!admin) {
      res.status(401).json({ error: 'Invalid administrator credentials.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid administrator credentials.' });
      return;
    }

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        usn: admin.usn,
        role: admin.role,
        name: admin.name,
      },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN as any }
    );

    res.json({
      message: 'Administrator authenticated successfully',
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('[ADMIN_LOGIN_ERROR]', error);
    res.status(500).json({ error: 'An unexpected error occurred during admin login.' });
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        usn: true,
        email: true,
        department: true,
        currentYear: true,
        graduationYear: true,
        gender: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('[GET_ME_ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const parseResult = UpdateProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0]?.message || 'Invalid input' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: parseResult.data,
      select: {
        id: true,
        name: true,
        usn: true,
        email: true,
        department: true,
        currentYear: true,
        graduationYear: true,
        gender: true,
        role: true,
        updatedAt: true,
      },
    });

    res.json({ message: 'Profile updated successfully', user: updated });
  } catch (error) {
    console.error('[UPDATE_PROFILE_ERROR]', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}
