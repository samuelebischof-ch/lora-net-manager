import { Module } from '@nestjs/common';
import { ModulesModule } from './modules/modules.module';
import { AuthModule } from './modules/auth.module';
import { GlobalModule } from './modules/global.module';

@Module({
  imports: [
    ModulesModule,
    AuthModule,
    GlobalModule,
  ],
  components: [],
})
export class ApplicationModule {}
