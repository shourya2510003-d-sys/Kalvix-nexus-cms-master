"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../prisma/prisma.service");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const mailer_1 = require("../../utils/mailer");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async signUp(email, passwordHash, firstName, lastName, tenantId) {
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new common_1.BadRequestException('User with this email already exists');
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
    async login(email, passwordHash, tenantId) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (tenantId && user.tenantId && user.tenantId !== tenantId) {
            throw new common_1.UnauthorizedException('Invalid credentials for this store');
        }
        const isValid = await bcrypt.compare(passwordHash, user.passwordHash);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const token = this.generateToken(user.id, user.email, user.role, user.tenantId);
        return { token, user: this.sanitizeUser(user) };
    }
    async verify2FA(email, otp) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user || user.role !== 'ADMIN' || !user.twoFactorSecret) {
            throw new common_1.UnauthorizedException('Invalid request');
        }
        if (user.twoFactorSecret.startsWith('TOTP:')) {
            const base32secret = user.twoFactorSecret.split(':')[1];
            const verified = speakeasy.totp.verify({
                secret: base32secret,
                encoding: 'base32',
                token: otp,
                window: 1
            });
            if (!verified) {
                throw new common_1.UnauthorizedException('Invalid Google Authenticator code');
            }
        }
        else {
            throw new common_1.UnauthorizedException('2FA not properly configured');
        }
        const token = this.generateToken(user.id, user.email, user.role);
        return { token, user: this.sanitizeUser(user) };
    }
    async setup2FA(userId, storeName) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        const formattedStoreName = storeName || 'Kalvix Nexus';
        const secret = speakeasy.generateSecret({ name: `${formattedStoreName} (${user.email})` });
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                twoFactorSecret: `TEMP_TOTP:${secret.base32}`,
            },
        });
        if (!secret.otpauth_url)
            throw new Error("Missing otpauth_url from speakeasy");
        const otpAuthUrl = await qrcode.toDataURL(secret.otpauth_url);
        return { otpAuthUrl };
    }
    async enable2FA(userId, otp) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.twoFactorSecret || !user.twoFactorSecret.startsWith('TEMP_TOTP:')) {
            throw new common_1.BadRequestException('2FA setup not initiated');
        }
        const base32secret = user.twoFactorSecret.split(':')[1];
        const verified = speakeasy.totp.verify({
            secret: base32secret,
            encoding: 'base32',
            token: otp,
            window: 1
        });
        if (!verified) {
            throw new common_1.BadRequestException('Invalid verification code');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                twoFactorSecret: `TOTP:${base32secret}`,
            },
        });
        return { success: true, message: '2FA successfully enabled' };
    }
    async requestDisable2FA(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.twoFactorSecret || !user.twoFactorSecret.startsWith('TOTP:')) {
            throw new common_1.BadRequestException('2FA is not enabled');
        }
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 15 * 60000);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: verificationCode,
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
        await mailer_1.mailer.sendMail(user.email, 'Verification Code to Disable 2FA', html);
        return { success: true, message: 'Verification email sent' };
    }
    async disable2FA(userId, code) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
            throw new common_1.BadRequestException('Invalid or expired request');
        }
        if (new Date() > user.resetPasswordExpires) {
            throw new common_1.BadRequestException('Verification code has expired');
        }
        if (code !== user.resetPasswordToken) {
            throw new common_1.BadRequestException('Invalid verification code');
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
    async resend2FA(email) {
        return { success: true, message: 'Google Authenticator setup is active. Please use your app.' };
    }
    async forgotPassword(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return { success: true, message: 'If that email exists, a reset link has been sent.' };
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = await bcrypt.hash(resetToken, 10);
        const expires = new Date(Date.now() + 3600000);
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
        await mailer_1.mailer.sendMail(user.email, 'Reset Your Password', html);
        return { success: true, message: 'Password reset email sent.' };
    }
    async resetPassword(email, token, newPassword) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
            throw new common_1.BadRequestException('Invalid or expired password reset token');
        }
        if (new Date() > user.resetPasswordExpires) {
            throw new common_1.BadRequestException('Password reset token has expired');
        }
        const isValidToken = await bcrypt.compare(token, user.resetPasswordToken);
        if (!isValidToken) {
            throw new common_1.BadRequestException('Invalid password reset token');
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
    async googleLogin(googleToken) {
        if (!googleToken) {
            throw new common_1.BadRequestException('Google token is required');
        }
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
    async sendOtp(phone) {
        if (!phone) {
            throw new common_1.BadRequestException('Phone number is required');
        }
        console.log(`[SMS OTP] Sent verification code 123456 to ${phone}`);
        return { success: true, message: 'OTP sent successfully (123456 for testing)' };
    }
    async verifyOtp(phone, otp) {
        if (otp !== '123456') {
            throw new common_1.BadRequestException('Invalid OTP code');
        }
        const email = `${phone.replace('+', '')}@kalvix.phone`;
        let user = await this.prisma.user.findUnique({ where: { phone } });
        if (!user) {
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
    async sendEmailOtp(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return { success: true, message: 'If the email is registered, an OTP has been sent.' };
        }
        let otp = Math.floor(100000 + Math.random() * 900000).toString();
        if (!process.env.SMTP_HOST && !process.env.SMTP_URL) {
            otp = '123456';
            console.log(`[Email OTP] SMTP not configured. Fallback OTP for ${email} is ${otp}`);
        }
        const hashedOtp = await bcrypt.hash(otp, 10);
        const expires = new Date(Date.now() + 15 * 60000);
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
        await mailer_1.mailer.sendMail(user.email, 'Your Login OTP', html);
        return { success: true, message: 'OTP sent successfully to your email.' };
    }
    async verifyEmailOtp(email, otp, tenantId) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
            throw new common_1.BadRequestException('Invalid or expired OTP');
        }
        if (new Date() > user.resetPasswordExpires) {
            throw new common_1.BadRequestException('OTP has expired');
        }
        const isValidToken = await bcrypt.compare(otp, user.resetPasswordToken);
        if (!isValidToken) {
            throw new common_1.BadRequestException('Invalid OTP');
        }
        if (tenantId && user.tenantId && user.tenantId !== tenantId) {
            throw new common_1.UnauthorizedException('Invalid credentials for this store');
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
    async setPassword(userId, newPassword) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: hash },
        });
        const token = this.generateToken(user.id, user.email, user.role, user.tenantId, false);
        return { success: true, token, user: this.sanitizeUser(user) };
    }
    async provisionTenant(name, slug, domain, ownerUid, ownerEmail) {
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
            }
            else if (!adminUser.tenantId) {
                await this.prisma.user.update({
                    where: { email: ownerEmail },
                    data: { tenantId: tenant.id, role: 'ADMIN' }
                });
            }
        }
        return { success: true, tenantId: tenant.id };
    }
    generateToken(userId, email, role, tenantId, requiresPasswordSetup = false) {
        return this.jwtService.sign({ sub: userId, email, role, tenant_id: tenantId, requiresPasswordSetup });
    }
    sanitizeUser(user) {
        const { passwordHash, ...rest } = user;
        return rest;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map