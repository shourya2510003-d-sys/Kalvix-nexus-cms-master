import { Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(prisma: PrismaService);
    validate(payload: any): Promise<{
        requiresPasswordSetup: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
        email: string;
        phone: string | null;
        firstName: string | null;
        lastName: string | null;
        role: import(".prisma/client").$Enums.Role;
        walletBalance: import("@prisma/client/runtime/library").Decimal;
        twoFactorSecret: string | null;
        twoFactorExpires: Date | null;
        twoFactorLastSent: Date | null;
        resetPasswordToken: string | null;
        resetPasswordExpires: Date | null;
    }>;
}
export {};
