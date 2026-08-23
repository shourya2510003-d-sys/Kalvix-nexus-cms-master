import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(
    @Request() req,
    @Body('email') email: string,
    @Body('password') passwordHash: string,
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
  ) {
    return this.authService.signUp(email, passwordHash, firstName, lastName, (req as any).tenantId);
  }

  @Post('login')
  async login(@Request() req, @Body('email') email: string, @Body('password') passwordHash: string) {
    return this.authService.login(email, passwordHash, (req as any).tenantId);
  }

  @Post('verify-2fa')
  async verify2FA(@Body('email') email: string, @Body('otp') otp: string) {
    return this.authService.verify2FA(email, otp);
  }

  @Post('verify-2fa/resend')
  async resend2FA(@Body('email') email: string) {
    return this.authService.resend2FA(email);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body('email') email: string,
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(email, token, newPassword);
  }


  @Post('google')
  async googleLogin(@Body('token') googleToken: string) {
    return this.authService.googleLogin(googleToken);
  }

  @Post('otp/send')
  async sendOtp(@Body('phone') phone: string) {
    return this.authService.sendOtp(phone);
  }

  @Post('otp/verify')
  async verifyOtp(@Body('phone') phone: string, @Body('otp') otp: string) {
    return this.authService.verifyOtp(phone, otp);
  }

  @Post('email-otp/send')
  async sendEmailOtp(@Body('email') email: string) {
    return this.authService.sendEmailOtp(email);
  }

  @Post('email-otp/verify')
  async verifyEmailOtp(@Request() req, @Body('email') email: string, @Body('otp') otp: string) {
    return this.authService.verifyEmailOtp(email, otp, (req as any).tenantId);
  }

  @Post('set-password')
  @UseGuards(AuthGuard('jwt'))
  async setPassword(@Request() req, @Body('password') password: string) {
    return this.authService.setPassword(req.user.id, password);
  }

  @Post('2fa/setup')
  @UseGuards(AuthGuard('jwt'))
  async setup2FA(@Request() req, @Body('storeName') storeName: string) {
    return this.authService.setup2FA(req.user.id, storeName);
  }

  @Post('2fa/enable')
  @UseGuards(AuthGuard('jwt'))
  async enable2FA(@Request() req, @Body('otp') otp: string) {
    return this.authService.enable2FA(req.user.id, otp);
  }

  @Post('2fa/request-disable')
  @UseGuards(AuthGuard('jwt'))
  async requestDisable2FA(@Request() req) {
    return this.authService.requestDisable2FA(req.user.id);
  }

  @Post('2fa/disable')
  @UseGuards(AuthGuard('jwt'))
  async disable2FA(@Request() req, @Body('code') code: string) {
    return this.authService.disable2FA(req.user.id, code);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@Request() req) {
    return req.user;
  }

  @Post('provision-tenant')
  async provisionTenant(
    @Body('name') name: string,
    @Body('slug') slug: string,
    @Body('domain') domain: string,
    @Body('ownerUid') ownerUid: string,
    @Body('ownerEmail') ownerEmail?: string,
  ) {
    return this.authService.provisionTenant(name, slug, domain, ownerUid, ownerEmail);
  }
}
