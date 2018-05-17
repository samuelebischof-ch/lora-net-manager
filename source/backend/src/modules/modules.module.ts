import { Module } from '@nestjs/common';
import { APIController } from './controllers/api.controller';
import { LoraGateway } from './gateways/lora.gateway';
import { GeneratorService } from './services/generator/generator.service';
import { GotthardpService } from './services/gotthardp/gotthardp.service';
import { GotthardpwsService } from './services/gotthardpws/gotthardpws.service';
import { MeteoService } from './services/meteo/meteo.service';
import { SetupService } from './services/setup/setup.service';

@Module({
  imports: [
  ],
  controllers: [
    APIController,
  ],
  components: [
    LoraGateway,
    GeneratorService,
    GotthardpService,
    GotthardpwsService,
    MeteoService,
    SetupService,
  ],
})
export class ModulesModule {}
