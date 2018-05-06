import { Module, Global } from '@nestjs/common';
import { RealmService } from './services/realm/realm.service';
import { LoggerService } from './services/logger/logger.service';
import { EventService } from './services/events/events.service';

@Global()
@Module({
  components: [
    RealmService,
    EventService,
    LoggerService,
  ],
  exports: [
    RealmService,
    EventService,
    LoggerService,
  ],
})
export class GlobalModule {}
