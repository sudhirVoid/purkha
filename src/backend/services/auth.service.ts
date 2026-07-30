import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { users, verificationTokens } from "../db/schema";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import nodemailer from "nodemailer";
import crypto from "crypto";

// Use a fallback secret for development if none is provided
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_dev_secret_key_change_in_production"
);

// Setup Nodemailer transporter
// Use Ethereal Email for testing if no real SMTP is provided in .env
let transporter: nodemailer.Transporter;

async function setupTransporter() {
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate test account for ethereal if not configured
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.warn("Using Ethereal Email for testing. Check server console for message preview URLs.");
  }
}

// Initialize transporter asynchronously
setupTransporter().catch(console.error);

export class AuthService {
  /**
   * Register a new user
   */
  static async registerUser(username: string, email: string, passwordHash: string) {
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      throw new Error("User with this email already exists");
    }

    const existingUsername = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (existingUsername.length > 0) {
      throw new Error("Username is already taken");
    }

    const id = crypto.randomUUID();
    await db.insert(users).values({
      id,
      username,
      email,
      passwordHash,
      emailVerified: false,
    });

    return id;
  }

  /**
   * Create verification token
   */
  static async createVerificationToken(userId: string, type: "email_verification" | "password_reset" | "magic_link") {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 2); // 2 hours from now

    await db.insert(verificationTokens).values({
      token,
      userId,
      type,
      expiresAt,
    });

    return token;
  }

  /**
   * Send verification email
   */
  static async sendVerificationEmail(email: string, token: string, baseUrl: string) {
    const verificationUrl = `${baseUrl}/api/auth/verify?token=${token}`;
    
    const info = await transporter.sendMail({
      from: '"Heirloom Purkha Register" <noreply@heirloom.app>',
      to: email,
      subject: "Verify your email address",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Welcome to Heirloom!</h2>
          <p>Please click the link below to verify your email address:</p>
          <a href="${verificationUrl}" style="display:inline-block; padding: 10px 20px; background-color: #6B1D1D; color: white; text-decoration: none;">Verify Email</a>
          <p>Or copy and paste this URL into your browser:</p>
          <p>${verificationUrl}</p>
        </div>
      `,
    });

    console.log("Email sent: %s", info.messageId);
    if (info.messageId && !process.env.SMTP_HOST) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email: string, token: string, baseUrl: string) {
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;
    
    const info = await transporter.sendMail({
      from: '"Heirloom Purkha Register" <noreply@heirloom.app>',
      to: email,
      subject: "Reset your password",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>Please click the link below to reset your password:</p>
          <a href="${resetUrl}" style="display:inline-block; padding: 10px 20px; background-color: #6B1D1D; color: white; text-decoration: none;">Reset Password</a>
          <p>Or copy and paste this URL into your browser:</p>
          <p>${resetUrl}</p>
        </div>
      `,
    });

    console.log("Password reset email sent: %s", info.messageId);
    if (info.messageId && !process.env.SMTP_HOST) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
  }

  /**
   * Verify an email token
   */
  static async verifyEmailToken(token: string) {
    const record = await db.select().from(verificationTokens)
      .where(and(eq(verificationTokens.token, token), eq(verificationTokens.type, "email_verification")))
      .limit(1);

    if (record.length === 0) {
      throw new Error("Invalid verification token");
    }

    const { userId, expiresAt } = record[0];

    if (new Date() > expiresAt) {
      throw new Error("Verification token expired");
    }

    await db.update(users).set({ emailVerified: true }).where(eq(users.id, userId));
    await db.delete(verificationTokens).where(eq(verificationTokens.token, token));

    return true;
  }

  /**
   * Reset Password
   */
  static async resetPassword(token: string, newPasswordHash: string) {
    const record = await db.select().from(verificationTokens)
      .where(and(eq(verificationTokens.token, token), eq(verificationTokens.type, "password_reset")))
      .limit(1);

    if (record.length === 0) {
      throw new Error("Invalid reset token");
    }

    const { userId, expiresAt } = record[0];

    if (new Date() > expiresAt) {
      throw new Error("Reset token expired");
    }

    await db.update(users).set({ passwordHash: newPasswordHash }).where(eq(users.id, userId));
    await db.delete(verificationTokens).where(eq(verificationTokens.token, token));

    return true;
  }

  /**
   * Generate JWT Session
   */
  static async createSessionToken(userId: string, email: string) {
    const jwt = await new SignJWT({ userId, email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);
    
    return jwt;
  }

  /**
   * Verify JWT Session
   */
  static async verifySessionToken(token: string) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return payload;
    } catch (e) {
      return null;
    }
  }
}
