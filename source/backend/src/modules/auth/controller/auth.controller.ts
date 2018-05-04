import { Controller, Post, HttpStatus, HttpCode, Body, Get } from '@nestjs/common';
import { AuthService } from '../service/auth/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token')
  @HttpCode(HttpStatus.OK)
  public async getToken(@Body() data) {
    return await this.authService.createToken(data.username, data.secret);
  }
}