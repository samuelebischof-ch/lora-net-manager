import { Module } from '@nestjs/common';
import { ModulesModule } from './modules/modules.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ModulesModule,
    AuthModule,
  ],
  components: [],
})
export class ApplicationModule {}
