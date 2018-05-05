import { Module } from '@nestjs/common';
import { MeteoService } from './services/meteo/meteo.service';
import { GotthardpService } from './services/gotthardp/gotthardp.service';
import { GotthardpwsService } from './services/gotthardpws/gotthardpws.service';
import { SetupService } from './services/setup/setup.service';
import { APIController } from './controllers/api.controller';
import { LoraGateway } from './gateways/lora.gateway';

@Module({
  imports: [
  ],
  controllers: [
    APIController,
  ],
  components: [
    LoraGateway,
    SetupService,
    MeteoService,
    GotthardpService,
    GotthardpwsService,
  ],
})
export class ModulesModule {}
