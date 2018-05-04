import * as Realm from 'realm';
import * as config from '../../../../../config.json';
import * as util from 'util';
import * as execIn from 'child_process';
import * as nodeAsk from 'node-ask';
import * as os from 'os';
import * as opn from 'opn';
import { error } from 'util';
import { Component } from '@nestjs/common';
import { RealmService } from '../realm/realm.service';
import { GotthardpService } from '../gotthardp/gotthardp.service';
import { GotthardpwsService } from '../gotthardpws/gotthardpws.service';
import { MeteoService } from '../meteo/meteo.service';

const prompt = nodeAsk.prompt;
const confirm = nodeAsk.confirm;
const multiline = nodeAsk.multiline;
const osName = os.platform();

@Component()
export class SetupService {
    constructor(private readonly _realm: RealmService,
        private readonly _gotthardp: GotthardpService,
        private readonly _gotthardpws: GotthardpwsService,
        private readonly _meteo: MeteoService) {}
        
        /**
        * @name setupAll
        * @description code executed at launch
        */
        async setupAll() {
            await this.startLoRaServer();
            await this._realm.generateKeys();
            await this._meteo.addLocation('Lugano');
            this._meteo.meteoLogging();
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
                    console.log('Install LoRaWAN server from file ./docker/install_gotthardp.sh')
                }
            } else { // on UNIX OS
                const exec = util.promisify(execIn.exec);
                try {
                    // checks if LoRaServer is installed
                    const { stdout, stderr } = await exec('docker start lorawan');
                    console.log('SUCCESS: DOCKER running');
                } catch (error) {
                    console.error('ERROR: DOCKER not running, installing...');
                    const dockerInstalled = await this.checkDockerInstalled();
                    if (dockerInstalled) {
                        // installs LoRaServer
                        await this.installGotthardp()
                    } else {
                        // installs DOCKER
                        await this.installDocker();
                        // tries again if everything works
                        await this.startLoRaServer();
                    }
                } 
            }
        }
        
        async checkDockerInstalled() {
            const exec = util.promisify(execIn.exec);
            try {
                const { stdout, stderr } = await exec('docker');
                console.log('OK' + stdout);
                return true;
            } catch (error) {
                return false;
            }
        }
        
        async installDocker() {
            const exec = util.promisify(execIn.exec);
            switch (osName) {
                case 'darwin':
                    try {
                        const { stdout, stderr } = await exec('cd ./docker && ./install_docker_mac.sh');
                        if (stdout) { console.log('SUCCESS: DOCKER ready in /Application folder'); }
                        await this.promptIfDockerInstalled();
                    } catch (error) {
                        console.log('ERROR: ' + error);
                    }
                    break;
                
                case 'linux':
                    try {
                        const { stdout, stderr } = await exec('cd ./docker && ./install_docker_linux.sh');
                        if (stdout) { console.log('SUCCESS: DOCKER installed'); }
                    } catch (error) {
                        console.log('ERROR: ' + error);
                    }
                    break;
                
                default:
                    break;
            } 
        }
        
        async promptIfDockerInstalled() {
            await prompt('Is Docker up and running [Yes]? ').then(
                async (answer) => {
                    if (answer !== 'Yes') {
                        await this.promptIfDockerInstalled();
                    }
                }
            );
        }
        
        async installGotthardp() {
            const exec = util.promisify(execIn.exec);
            try {
                const { stdout, stderr } = await exec('cd ./docker && ./install_gotthardp.sh');
                console.log('SUCCESS: DOCKER installed');
                return true;
            } catch (error) {
                console.log('ERROR: ' + error);
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
                console.log('SUCCESS: LORASERVER started'); 
                return true;
            } else {
                console.error('ERROR: LORASERVER not started');
                return false;
            }
        }
        
        /**
        * @name setupLoRaServer
        * @description sends all the settings to the LoRaServer
        */
        async setupLoRaServer() {
            // TODO remove
            this._gotthardp.addGateway({});
            await this.delay(2000);
            this._gotthardp.addNetwork();
            await this.delay(2000);
            this._gotthardp.addProfile();
            await this.delay(2000);
            this._gotthardp.addHandler();
            await this.delay(2000);
            this._gotthardp.addConnectors();
            // TODO: remove -->
            await this.delay(2000);
            this.setupTestData();
            // <--
        }
        
        /**
        * @name setupWebsockets
        * @description connects to LoRaServer websockets
        */
        async setupWebsockets() {
            this._gotthardpws.connect();
            this._gotthardpws.events();
        }
        
        async setupTestData() {
            // TODO: remove
            this._gotthardp.addDevice(
                {
                    desc: 'Test description 1',
                    deveui: '007C411FF7223000',
                    appeui: '0000000000000001',
                    appkey: 'C2BDB80EACE6D597643A73E13DBA69FC',
                    devaddr: 'AAAAAAAA',
                },
            );
            this._gotthardp.addDevice(
                {
                    desc: 'Test description 2',
                    deveui: '007C411FF7223001',
                    appeui: '0000000000000001',
                    appkey: 'C2BDB80EACE6D597643A73E13DBA69FC',
                    devaddr: 'BBBBBBBB',
                },
            );
            this._gotthardp.addDevice(
                {
                    desc: 'Test description 2',
                    deveui: '007C411FF7223002',
                    appeui: '0000000000000001',
                    appkey: 'C2BDB80EACE6D597643A73E13DBA69FC',
                    devaddr: 'CCCCCCCC',
                },
            );
            this._gotthardp.addDevice(
                {
                    desc: 'Test description 2',
                    deveui: '007C411FF7223003',
                    appeui: '0000000000000001',
                    appkey: 'C2BDB80EACE6D597643A73E13DBA69FC',
                    devaddr: 'DDDDDDDD',
                },
            );
            console.log('SUCCESS: LORASERVER seeded');
            await this._realm.createDevice(
                {
                    deveui: '007C411FF7223000',
                    devaddr: 'AAAAAAAA',
                    desc: 'Test description',
                    room: { roomName: 'Room 1' },
                    battery: 23,
                    rssi: 23,
                    last_seen: new Date(Date.now()),
                    model: 'esp32',
                    has_temperature: true,
                    has_pressure: true,
                    has_humidity: true,
                    has_moisture: false,
                    has_movement: false,
                    has_door_sensor: false,
                    has_light_sensor: false
                } as any
            );
            await this._realm.createDevice(
                {
                    deveui: '007C411FF7223001',
                    devaddr: 'BBBBBBBB',
                    desc: 'Test description',
                    room: { roomName: 'Room 1' },
                    battery: 23,
                    rssi: 23,
                    last_seen: new Date(Date.now()),
                    model: 'esp32',
                    has_temperature: true,
                    has_pressure: true,
                    has_humidity: true,
                    has_moisture: false,
                    has_movement: false,
                    has_door_sensor: false,
                    has_light_sensor: false
                } as any
            );
            await this._realm.createDevice(
                {
                    deveui: '007C411FF7223002',
                    devaddr: 'CCCCCCCC',
                    desc: 'Test description',
                    room: { roomName: 'Room 2' },
                    battery: 23,
                    rssi: 23,
                    last_seen: new Date(Date.now()),
                    model: 'esp32',
                    has_temperature: true,
                    has_pressure: true,
                    has_humidity: true,
                    has_moisture: false,
                    has_movement: false,
                    has_door_sensor: false,
                    has_light_sensor: false
                } as any
            );
            await this._realm.createDevice(
                {
                    deveui: '007C411FF7223003',
                    devaddr: 'DDDDDDDD',
                    desc: 'Test description',
                    room: { roomName: 'Room 2' },
                    battery: 23,
                    rssi: 23,
                    last_seen: new Date(Date.now()),
                    model: 'esp32',
                    has_temperature: false,
                    has_pressure: false,
                    has_humidity: false,
                    has_moisture: true,
                    has_movement: false,
                    has_door_sensor: false,
                    has_light_sensor: false
                } as any
            );
            // this._gotthardpws.simulateData([
            //     {deveui: '007C411FF7223001', city: 'Lugano'},
            //     {deveui: '007C411FF7223002', city: 'Zurich'},
            //     {deveui: '007C411FF7223003', city: 'Bellinzona'}]);
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