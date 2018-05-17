import {
  Module,
  NestModule,
  MiddlewaresConsumer,
  RequestMethod,
} from '@nestjs/common';
import * as passport from 'passport';
import { AuthController } from './auth/controller/auth.controller';
import { AuthService } from './auth/service/auth/auth.service';
import { JwtStrategy } from './auth/passport/jwt.strategy';

@Module({
  components: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule implements NestModule {
  public configure(consumer: MiddlewaresConsumer) {
    consumer
      .apply(passport.authenticate('jwt', { session: false }))
      .forRoutes({ path: '/api/*', method: RequestMethod.ALL });
  }
}