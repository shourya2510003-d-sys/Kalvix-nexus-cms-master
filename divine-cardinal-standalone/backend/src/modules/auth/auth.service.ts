import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { mailer } from '../../utils/mailer';
import speakeasy = require('speakeasy');
import qrcode = require('qrcode');

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Local signup
  async signUp(email: string, passwordHash: string, firstName: string, lastName: string, tenantId?: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException('User with this email already exists');
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(passwordHash, salt);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: hash,
        firstName,
        lastName,
        tenantId,
      },
    });

    const token = this.generateToken(user.id, user.email, user.role, user.tenantId);
    return { token, user: this.sanitizeUser(user) };
  }

  // Local login
  async login(email: string, passwordHash: string, tenantId?: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (tenantId && user.tenantId && user.tenantId !== tenantId) {
      throw new UnauthorizedException('Invalid credentials for this store');
    }

    const isValid = await bcrypt.compare(passwordHash, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user.id, user.email, user.role, user.tenantId);
    return { token, user: this.sanitizeUser(user) };
  }

  // Verify Admin 2FA during Login
  async verify2FA(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== 'ADMIN' || !user.twoFactorSecret) {
      throw new UnauthorizedException('Invalid request');
    }
    
    if (user.twoFactorSecret.startsWith('TOTP:')) {
      const base32secret = user.twoFactorSecret.split(':')[1];
      const verified = speakeasy.totp.verify({
        secret: base32secret,
        encoding: 'base32',
        token: otp,
        window: 1 // Allow 30 seconds before and after
      });

      if (!verified) {
        throw new UnauthorizedException('Invalid Google Authenticator code');
      }
    } else {
      throw new UnauthorizedException('2FA not properly configured');
    }
    
    const token = this.generateToken(user.id, user.email, user.role);
    return { token, user: this.sanitizeUser(user) };
  }

  // Setup 2FA from Admin Dashboard
  async setup2FA(userId: string, storeName: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const formattedStoreName = storeName || 'Kalvix Nexus';
    const secret = speakeasy.generateSecret({ name: `${formattedStoreName} (${user.email})` });
    
    // Save as TEMP until verified
    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        twoFactorSecret: `TEMP_TOTP:${secret.base32}`,
      },
    });

    if (!secret.otpauth_url) throw new Error("Missing otpauth_url from speakeasy");
    const otpAuthUrl = await qrcode.toDataURL(secret.otpauth_url);

    return { otpAuthUrl };
  }

  // Enable 2FA from Admin Dashboard
  async enable2FA(userId: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret || !user.twoFactorSecret.startsWith('TEMP_TOTP:')) {
      throw new BadRequestException('2FA setup not initiated');
    }

    const base32secret = user.twoFactorSecret.split(':')[1];
    const verified = speakeasy.totp.verify({
      secret: base32secret,
      encoding: 'base32',
      token: otp,
      window: 1
    });

    if (!verified) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        twoFactorSecret: `TOTP:${base32secret}`,
      },
    });

    return { success: true, message: '2FA successfully enabled' };
  }

  // Request Disable 2FA
  async requestDisable2FA(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret || !user.twoFactorSecret.startsWith('TOTP:')) {
      throw new BadRequestException('2FA is not enabled');
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60000); // 15 mins

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: verificationCode, // Reusing this field for 2FA disable token
        resetPasswordExpires: expires,
      },
    });

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #333;">Disable 2-Factor Authentication</h2>
        <p>You requested to disable Google Authenticator for your account.</p>
        <p>Your verification code is: <strong>${verificationCode}</strong></p>
        <p style="color: #666; font-size: 12px;">If you did not request this, please secure your account immediately.</p>
      </div>
    `;
    
    await mailer.sendMail(user.email, 'Verification Code to Disable 2FA', html);
    return { success: true, message: 'Verification email sent' };
  }

  // Disable 2FA
  async disable2FA(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
      throw new BadRequestException('Invalid or expired request');
    }

    if (new Date() > user.resetPasswordExpires) {
      throw new BadRequestException('Verification code has expired');
    }

    if (code !== user.resetPasswordToken) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: null,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { success: true, message: '2FA has been disabled' };
  }

  // Resend Admin 2FA OTP (No-op for Google Authenticator)
  async resend2FA(email: string) {
    return { success: true, message: 'Google Authenticator setup is active. Please use your app.' };
  }

  // Forgot Password
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't throw error to prevent email enumeration, just return success
      return { success: true, message: 'If that email exists, a reset link has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: expires,
      },
    });

    const resetLink = `\${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/reset-password?token=\${resetToken}&email=\${encodeURIComponent(email)}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested a password reset for your Divine Cardinal account.</p>
        <p>Click the link below to set a new password. This link is valid for 1 hour.</p>
        <div style="margin: 30px 0;">
          <a href="\${resetLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 12px;">If you did not request this, you can safely ignore this email.</p>
      </div>
    `;
    
    await mailer.sendMail(user.email, 'Reset Your Password', html);
    return { success: true, message: 'Password reset email sent.' };
  }

  // Reset Password
  async resetPassword(email: string, token: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    if (new Date() > user.resetPasswordExpires) {
      throw new BadRequestException('Password reset token has expired');
    }

    const isValidToken = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isValidToken) {
      throw new BadRequestException('Invalid password reset token');
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { success: true, message: 'Password has been reset successfully. You can now login.' };
  }

  // Google OAuth Login / Register
  async googleLogin(googleToken: string) {
    // In production, you would fetch userinfo from Google API:
    // https://oauth2.googleapis.com/tokeninfo?id_token=googleToken
    // For this custom platform, we mock the validation and extract details from token structure:
    if (!googleToken) {
      throw new BadRequestException('Google token is required');
    }
    
    // Mock user details (normally validated via OAuth SDK)
    const email = `google_${googleToken.substring(0, 8)}@gmail.com`;
    const firstName = 'Google';
    const lastName = 'User';

    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
        },
      });
    }

    const token = this.generateToken(user.id, user.email, user.role);
    return { token, user: this.sanitizeUser(user) };
  }

  // Phone OTP Send
  async sendOtp(phone: string) {
    if (!phone) {
      throw new BadRequestException('Phone number is required');
    }
    // Mock Twilio send. In production:
    // await this.twilioClient.messages.create({ body: `Your OTP is 123456`, from: process.env.TWILIO_PHONE_NUMBER, to: phone })
    console.log(`[SMS OTP] Sent verification code 123456 to ${phone}`);
    return { success: true, message: 'OTP sent successfully (123456 for testing)' };
  }

  // Phone OTP Verify
  async verifyOtp(phone: string, otp: string) {
    if (otp !== '123456') {
      throw new BadRequestException('Invalid OTP code');
    }

    const email = `${phone.replace('+', '')}@kalvix.phone`;
    let user = await this.prisma.user.findUnique({ where: { phone } });
    
    if (!user) {
      // Check if temporary email exists
      user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email,
            phone,
            firstName: 'Phone',
            lastName: 'Customer',
          },
        });
      }
    }

    const requiresPasswordSetup = !user.passwordHash;
    const token = this.generateToken(user.id, user.email, user.role, user.tenantId, requiresPasswordSetup);
    return { token, user: this.sanitizeUser(user), requiresPasswordSetup };
  }

  // Email OTP Send
  async sendEmailOtp(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't leak user existence
      return { success: true, message: 'If the email is registered, an OTP has been sent.' };
    }

    let otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Fallback OTP for testing if SMTP is not configured
    if (!process.env.SMTP_HOST && !process.env.SMTP_URL) {
      otp = '123456';
      console.log(`[Email OTP] SMTP not configured. Fallback OTP for ${email} is ${otp}`);
    }

    const hashedOtp = await bcrypt.hash(otp, 10);
    const expires = new Date(Date.now() + 15 * 60000); // 15 mins

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashedOtp,
        resetPasswordExpires: expires,
      },
    });

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #333;">Login to Kalvix Nexus</h2>
        <p>Your One-Time Password (OTP) for login is:</p>
        <h1 style="color: #D4AF37; letter-spacing: 5px;">${otp}</h1>
        <p>This code will expire in 15 minutes.</p>
        <p style="color: #666; font-size: 12px;">If you did not request this, please ignore this email.</p>
      </div>
    `;

    await mailer.sendMail(user.email, 'Your Login OTP', html);
    return { success: true, message: 'OTP sent successfully to your email.' };
  }

  // Email OTP Verify
  async verifyEmailOtp(email: string, otp: string, tenantId?: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    if (new Date() > user.resetPasswordExpires) {
      throw new BadRequestException('OTP has expired');
    }

    const isValidToken = await bcrypt.compare(otp, user.resetPasswordToken);
    if (!isValidToken) {
      throw new BadRequestException('Invalid OTP');
    }

    if (tenantId && user.tenantId && user.tenantId !== tenantId) {
      throw new UnauthorizedException('Invalid credentials for this store');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    const requiresPasswordSetup = !user.passwordHash;
    const token = this.generateToken(user.id, user.email, user.role, user.tenantId, requiresPasswordSetup);
    return { token, user: this.sanitizeUser(user), requiresPasswordSetup };
  }

  // Set Password (for initial setup)
  async setPassword(userId: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hash },
    });

    const token = this.generateToken(user.id, user.email, user.role, user.tenantId, false);
    return { success: true, token, user: this.sanitizeUser(user) };
  }

  async provisionTenant(name: string, slug: string, domain: string, ownerUid: string, ownerEmail?: string) {
    let tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) {
      tenant = await this.prisma.tenant.create({
        data: {
          name,
          slug,
          domain,
        }
      });
    }

    if (ownerEmail) {
      let adminUser = await this.prisma.user.findUnique({ where: { email: ownerEmail } });
      if (!adminUser) {
        await this.prisma.user.create({
          data: {
            email: ownerEmail,
            firstName: 'Store',
            lastName: 'Admin',
            role: 'ADMIN',
            tenantId: tenant.id
          }
        });
      } else if (!adminUser.tenantId) {
        await this.prisma.user.update({
          where: { email: ownerEmail },
          data: { tenantId: tenant.id, role: 'ADMIN' }
        });
      }
    }

    return { success: true, tenantId: tenant.id };
  }

  private generateToken(userId: string, email: string, role: string, tenantId?: string, requiresPasswordSetup: boolean = false) {
    return this.jwtService.sign({ sub: userId, email, role, tenant_id: tenantId, requiresPasswordSetup });
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
