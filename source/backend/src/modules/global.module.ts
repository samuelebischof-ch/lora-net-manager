import { Global, Module } from '@nestjs/common';
import { EventService } from './services/events/events.service';
import { LoggerService } from './services/logger/logger.service';
import { RealmService } from './services/realm/realm.service';

@Global()
@Module({
  components: [
    EventService,
    LoggerService,
    RealmService,
  ],
  exports: [
    EventService,
    LoggerService,
    RealmService,
  ],
})
export class GlobalModule {}
