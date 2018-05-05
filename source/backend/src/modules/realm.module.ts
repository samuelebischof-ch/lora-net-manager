import { Module, Global } from '@nestjs/common';
import { RealmService } from './services/realm/realm.service';

@Global()
@Module({
  components: [
    RealmService,
  ],
  exports: [
    RealmService,
  ],
})
export class RealmModule {}
