import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signup(req: any, email: string, passwordHash: string, firstName: string, lastName: string): Promise<{
        token: string;
        user: any;
    }>;
    login(req: any, email: string, passwordHash: string): Promise<{
        token: string;
        user: any;
    }>;
    verify2FA(email: string, otp: string): Promise<{
        token: string;
        user: any;
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
    verifyEmailOtp(req: any, email: string, otp: string): Promise<{
        token: string;
        user: any;
        requiresPasswordSetup: boolean;
    }>;
    setPassword(req: any, password: string): Promise<{
        success: boolean;
        token: string;
        user: any;
    }>;
    setup2FA(req: any, storeName: string): Promise<{
        otpAuthUrl: string;
    }>;
    enable2FA(req: any, otp: string): Promise<{
        success: boolean;
        message: string;
    }>;
    requestDisable2FA(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    disable2FA(req: any, code: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getMe(req: any): Promise<any>;
    provisionTenant(name: string, slug: string, domain: string, ownerUid: string, ownerEmail?: string): Promise<{
        success: boolean;
        tenantId: string;
    }>;
}
