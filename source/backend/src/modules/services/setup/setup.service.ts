import * as Realm from 'realm';
import * as util from 'util';
import * as execIn from 'child_process';
import * as nodeAsk from 'node-ask';
import * as os from 'os';
import * as opn from 'opn';
import * as seedJSON from '../../../../seed.json';
import { error } from 'util';
import { Component } from '@nestjs/common';
import { RealmService } from '../realm/realm.service';
import { GotthardpService } from '../gotthardp/gotthardp.service';
import { GotthardpwsService } from '../gotthardpws/gotthardpws.service';
import { MeteoService } from '../meteo/meteo.service';
import { Seed } from '../../../../../shared/interfaces/seed.interface';
import { LoggerService } from '../logger/logger.service';

const seed: Seed = seedJSON as any;
const prompt = nodeAsk.prompt;
const confirm = nodeAsk.confirm;
const multiline = nodeAsk.multiline;
const osName = os.platform();

@Component()
export class SetupService {
    constructor(private readonly _realm: RealmService,
        private readonly _gotthardp: GotthardpService,
        private readonly _gotthardpws: GotthardpwsService,
        private readonly _meteo: MeteoService,
        private readonly _logger: LoggerService) {}
        
        /**
        * @name setupAll
        * @description code executed at launch
        */
        async setupAll() {
            await this.startLoRaServer();
            await this._realm.generateKeys();
            this._meteo.meteoLogging();
            await this.delay(5000);
            await this.setupLoRaServer();
            await this.delay(3000);
            await this.setupWebsockets();
            // this._gotthardp.downlinkTo('65497257', {data: '0026BF08BD03CD35000000000000FFFF', confirmed: true, receipt: '123XYZ'});
        }
        
        /**
        * @name startLoRaServer
        * @description starts the LoRaWAN server, if error try docker command and in the end install docker
        */
        async startLoRaServer() {
            if (osName === 'win32') {  // on WINDOWS OS
                // check if docker image is running
                if (!await this.pingLoRaServer()) {
                    opn('https://www.docker.com/docker-windows');
                    await this.delay(3000);
                    await this.promptIfDockerInstalled();
                    this._logger.print('Install LoRaWAN server from file ./docker/install_gotthardp.sh')
                }
            } else { // on UNIX OS
                const exec = util.promisify(execIn.exec);
                try {
                    // checks if LoRaServer is installed
                    const { stdout, stderr } = await exec('docker start lorawan');
                    this._logger.success('Docker running');
                } catch (error) {
                    const dockerInstalled = await this.checkDockerInstalled();
                    if (dockerInstalled) {
                        // installs LoRaServer
                        this._logger.print('WAIT: LoRaWAN server not installed, installing...');
                        await this.installGotthardp()
                    } else {
                        // installs Docker
                        this._logger.print('WAIT: Docker not running, installing...');
                        await this.installDocker();
                        // tries again if everything works
                        await this.startLoRaServer();
                    }
                } 
            }
        }
        
        /**
        * @name checkDockerInstalled
        * @description checks if Docker is installed in the system on UNIX
        */
        async checkDockerInstalled() {
            const exec = util.promisify(execIn.exec);
            try {
                const { stdout, stderr } = await exec('docker');
                this._logger.success('Docker installed');
                return true;
            } catch (error) {
                return false;
            }
        }
        
        /**
        * @name installDocker
        * @description runs the Docker installation script on UNIX systems
        */
        async installDocker() {
            const exec = util.promisify(execIn.exec);
            switch (osName) {
                case 'darwin':
                try {
                    const { stdout, stderr } = await exec('cd ./docker && ./install_docker_mac.sh');
                    if (stdout) { this._logger.success('Docker ready in /Application folder'); }
                    await this.promptIfDockerInstalled();
                } catch (error) {
                    this._logger.error(error);
                }
                break;
                
                case 'linux':
                try {
                    const { stdout, stderr } = await exec('cd ./docker && ./install_docker_linux.sh');
                    if (stdout) { this._logger.success('Docker installed'); }
                } catch (error) {
                    this._logger.error(error);
                }
                break;
                
                default:
                break;
            } 
        }
        
        /**
        * @name promptIfDockerInstalled
        * @description asks the user if Docker is installed and running
        */
        async promptIfDockerInstalled() {
            await prompt('Is Docker up and running [Yes]? ').then(
                async (answer) => {
                    if (answer !== 'Yes') {
                        await this.promptIfDockerInstalled();
                    }
                }
            );
        }
        
        /**
        * @name installGotthardp
        * @description runs the LoRaWAN server install script on UNIX systems
        */
        async installGotthardp() {
            const exec = util.promisify(execIn.exec);
            try {
                const { stdout, stderr } = await exec('cd ./docker && ./install_gotthardp.sh');
                this._logger.success('Docker installed');
                return true;
            } catch (error) {
                this._logger.error(error);
                return false;
            } 
        }
        
        /**
        * @name pingLoRaServer
        * @returns Boolean
        * @description checks if the LoRaServer is active
        */
        async pingLoRaServer() {
            const pingResponse = await this._gotthardp.pingGotthardp();
            if (pingResponse) { 
                this._logger.success('LoRaServer started'); 
                return true;
            } else {
                this._logger.error('LoRaServer not started');
                return false;
            }
        }
        
        /**
        * @name setupLoRaServer
        * @description sends all the settings to the LoRaServer
        */
        async setupLoRaServer() {
            this._gotthardp.addNetwork();
            await this.delay(2000);
            this._gotthardp.addProfile();
            await this.delay(2000);
            this._gotthardp.addHandler();
            await this.delay(2000);
            this._gotthardp.addConnectors();
            await this.delay(2000);
            this.seedDataFromFile();
        }
        
        /**
        * @name setupWebsockets
        * @description connects to LoRaServer websockets
        */
        async setupWebsockets() {
            this._gotthardpws.connect();
            this._gotthardpws.events();
        }
        
        /**
        * @name seedDataFromFile
        * @description if seed.json has values in it they are seeded to the database and LoRaWAN server
        */
        async seedDataFromFile() {
            seed.gateways.forEach(gateway => {
                this._gotthardp.addGateway(gateway);
            });
            seed.devices.forEach(device => {
                device.last_seen = new Date(Date.now());
                this._gotthardp.addDevice(device);
                this._realm.createDevice(device as any);
            });
            seed.locations.forEach(location => {
                this._meteo.addLocation(location as string);
            });
        }
        
        /**
        * @name delay
        * @param ms
        * @description returns a Promise of a timeout
        */
        async delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    }