import { Module, Global } from '@nestjs/common';
import { RealmService } from './services/realm/realm.service';
import { LoggerService } from './services/logger/logger.service';

@Global()
@Module({
  components: [
    RealmService,
    LoggerService,
  ],
  exports: [
    RealmService,
    LoggerService,
  ],
})
export class GlobalModule {}
