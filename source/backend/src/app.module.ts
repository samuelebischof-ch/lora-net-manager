import { Module } from '@nestjs/common';
import { ModulesModule } from './modules/modules.module';
import { AuthModule } from './modules/auth.module';
import { RealmModule } from './modules/realm.module';

@Module({
  imports: [
    ModulesModule,
    AuthModule,
    RealmModule,
  ],
  components: [],
})
export class ApplicationModule {}
