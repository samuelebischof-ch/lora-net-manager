import * as passport from 'passport';
import {
  Module,
  NestModule,
  MiddlewaresConsumer,
  RequestMethod,
} from '@nestjs/common';
import { JwtStrategy } from './passport/jwt.strategy';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth/auth.service';

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