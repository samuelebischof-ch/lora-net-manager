import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app.module';
import { ModulesModule } from './modules/modules.module';
import { SetupService } from './modules/services/setup/setup.service';
import * as express from 'express';
import * as path from 'path';
import * as util from 'util';
import * as execIn from 'child_process';
import * as fs from 'fs';

/**
 * @name generateCertificates
 * @description generates self signed SSL key
 */
async function generateCertificates() {
  const exec = await util.promisify(execIn.exec);
  try {
    const { stdout, stderr } = await exec('cd ./secrets && ./generate_keys.sh');
  } catch (error) {
    // tslint:disable-next-line:no-console
    console.error('ERROR: poblem creating https certificates: ' + error);
  }
}

/**
 * @name bootstrap
 * @description starts the server
 */
async function bootstrap() {

  let sslFound = false;

  // check for certificates existence
  if ((fs.existsSync('./secrets/private-key.pem') && fs.existsSync('./secrets/public-certificate.pem'))) {
    sslFound = true;
  } else {
    // await this.generateCertificates();
  }

	// load https certificates
  let options = {};
  if (sslFound) {
    options = {
      httpsOptions : {
        key: fs.readFileSync('./secrets/private-key.pem'),
        cert: fs.readFileSync('./secrets/public-certificate.pem'),
      },
    };
  }

  // express application
  const app = await NestFactory.create(ApplicationModule, options);

  // define folder for public files
  app.use(express.static(path.join(__dirname, 'public')));
  app.set('views', __dirname + '/views');
  app.set('view engine', 'html');

	// run setup function
  const setup = app.select(ModulesModule).get(SetupService);
  setup.setupAll();

	// server begins to listen on port 3000
  await app.listen(3000);
}
bootstrap();