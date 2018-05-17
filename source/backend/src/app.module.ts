import { Module } from '@nestjs/common';
import { ModulesModule } from './modules/modules.module';
import { AuthModule } from './modules/auth.module';
import { GlobalModule } from './modules/global.module';
import { AngularModule } from './modules/angular.module';

@Module({
	imports: [
		ModulesModule,
		AuthModule,
		AngularModule,
		GlobalModule,
	],
	components: [],
})
export class ApplicationModule {}