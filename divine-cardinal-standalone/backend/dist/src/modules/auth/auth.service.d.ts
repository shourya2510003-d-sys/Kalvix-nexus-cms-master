import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    signUp(email: string, passwordHash: string, firstName: string, lastName: string, tenantId?: string): Promise<{
        token: string;
        user: any;
    }>;
    login(email: string, passwordHash: string, tenantId?: string): Promise<{
        token: string;
        user: any;
    }>;
    verify2FA(email: string, otp: string): Promise<{
        token: string;
        user: any;
    }>;
    setup2FA(userId: string, storeName: string): Promise<{
        otpAuthUrl: string;
    }>;
    enable2FA(userId: string, otp: string): Promise<{
        success: boolean;
        message: string;
    }>;
    requestDisable2FA(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    disable2FA(userId: string, code: string): Promise<{
        success: boolean;
        message: string;
    }>;
    resend2FA(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(email: string, token: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
    }>;
    googleLogin(googleToken: string): Promise<{
        token: string;
        user: any;
    }>;
    sendOtp(phone: string): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyOtp(phone: string, otp: string): Promise<{
        token: string;
        user: any;
        requiresPasswordSetup: boolean;
    }>;
    sendEmailOtp(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyEmailOtp(email: string, otp: string, tenantId?: string): Promise<{
        token: string;
        user: any;
        requiresPasswordSetup: boolean;
    }>;
    setPassword(userId: string, newPassword: string): Promise<{
        success: boolean;
        token: string;
        user: any;
    }>;
    provisionTenant(name: string, slug: string, domain: string, ownerUid: string, ownerEmail?: string): Promise<{
        success: boolean;
        tenantId: string;
    }>;
    private generateToken;
    private sanitizeUser;
}
