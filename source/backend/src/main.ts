import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app.module';
import { ModulesModule } from './modules/modules.module';
import { SetupService } from './modules/services/setup/setup.service';
import * as util from 'util';
import * as execIn from 'child_process';
import * as fs from 'fs';

async function bootstrap() {
	
	// create https certificates if not existent
	if (!(fs.existsSync('./secrets/private-key.pem') && fs.existsSync('./secrets/public-certificate.pem'))) {
    console.log('Certificates not found');
		const exec = util.promisify(execIn.exec);
		try {
			const { stdout, stderr } = await exec('cd ./secrets && ./generate_keys.sh');
			console.log(stdout)
		} catch (error) {
			console.error('ERROR: poblem creating https certificates: ' + error);
		} 
}
	
	// load https certificates
	const httpsOptions = {
		key: fs.readFileSync('./secrets/private-key.pem'),
		cert: fs.readFileSync('./secrets/public-certificate.pem')
	};
	
	// create server
	const app = await NestFactory.create(ApplicationModule, {
		httpsOptions,
	});
	
	// run setup function
	const setup = app.select(ModulesModule).get(SetupService);
	setup.setupAll();
	
	// server begins to listen on port 3000
	await app.listen(3000);
}
bootstrap();