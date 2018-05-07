import { Module } from '@nestjs/common';
import { AngularController } from './angular/controller/angular.controller';

@Module({
  components: [],
  controllers: [AngularController],
  exports: [],
})
export class AngularModule {}
