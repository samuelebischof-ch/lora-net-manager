import { Controller, Get, Post, Delete, Param, Query, Body } from '@nestjs/common';
import { RealmService } from '../services/realm/realm.service';
import { GotthardpService } from '../services/gotthardp/gotthardp.service';
import { MeteoService } from '../services/meteo/meteo.service';
import { Gateway } from '../interfaces/gateway.interface';
import { Device } from '../interfaces/device.interface';
import * as crypto from 'crypto';
import { LoggerService } from '../services/logger/logger.service';

@Controller('api')
export class APIController {
    constructor(private readonly _realm: RealmService,
                private readonly _gotthardp: GotthardpService,
                private readonly _meteo: MeteoService,
                private readonly _logger: LoggerService) {}
        
/********************************** gateways *********************************/
        
        /**
        * @name getGateways
        * @returns a list of gateways
        * @description sends the list of gateways registered to gotthardp
        * to the frontend angular application.
        */
        @Get('gateways')
        async getGateways() {
            const gateways = await this._gotthardp.getGateways();
            let outGateways = [];
            for (let c = 0; c < gateways.length; c++) {
                let gateway = {} as Gateway;
                gateway.mac = gateways[c].mac;
                gateway.desc = gateways[c].desc;
                gateway.last_alive = gateways[c].last_alive;
                gateway.ip_address = gateways[c].ip_address;
                outGateways.push(gateway);
            }
            return outGateways;
        }
        
        /**
         * @name addGateway
         * @param req
         * @description adds a gateway to the LoRaServer
         */
        @Post('gateway')
        async addGateway(@Body() req) {
            await this._gotthardp.addGateway(req);
        }

        /**
        * @name removeGateway
        * @param param 
        * @description removes the gateway from the gotthardp server
        */
        @Delete('gateway/:mac')
        async removeGateway(@Param() param) {
            await this._gotthardp.removeGateway(param.mac);
            this._logger.success('gateway ' + param.mac + ' removed');
        }
        
/********************************** device ***********************************/
        
        /**
        * @name getDevices
        * @returns a list of devices
        * @description sends the list of devices registered to gotthardp
        * to the frontend angular application.
        */
        @Get('devices')
        async getDevices() {
            const devices = await this._gotthardp.getDevices();
            let outDevices = [];
            for (let c = 0; c < devices.length; c++) {
                let device = {} as Device;
                device.appeui = devices[c].appeui;
                device.appkey = devices[c].appkey;
                device.deveui = devices[c].deveui;
                device.desc = devices[c].desc;
                device.room = await this._realm.getDeviceRoom(devices[c].deveui);
                device.last_join = devices[c].last_join;
                outDevices.push(device);
            }
            return outDevices;
        }

        /**
        * @name getDevicesByRoom
        * @returns a list of devices grouped by room
        */
       @Get('devicesbyroom')
       async getDevicesByRoom() {
           return await this._realm.getDevicesByRoom();
       }

        /**
         * @name addDevice
         * @param req
         * @description adds a device to the LoRaServer
         */
        @Post('device')
        async addDevice(@Body() req) {
            await this._realm.createDevice(req);
            await this._gotthardp.addDevice(req);
        }

        /**
        * @name removeDevice
        * @param param 
        * @description removes the device from the gotthardp server and the realm DB
        */
        @Delete('device/:deveui')
        async removeDevice(@Param() param) {
            await this._gotthardp.removeDevice(param.deveui);
            await this._realm.removeDevice(param.deveui);
            this._logger.success('device ' + param.deveui + ' removed');
        }

        @Get('data/:query?')
        async getData(@Query() params) {
            return await this._realm.getSensorData(params);
        }

        @Get('gendeveui')
        async getDeveui() {
            return { deveui: crypto.randomBytes(8).toString('hex') };
        }

        @Get('gendevaddr')
        async getDevaddr() {
            return { devaddr: crypto.randomBytes(4).toString('hex') };
        }

/*********************************** konva ***********************************/

        @Get('konva')
        async loadKonva() {
            return await this._realm.loadKonva();
        }

        @Post('konva')
        async saveKonva(@Body() data) {
            await this._realm.saveKonva(data);
        }
        
/*********************************** meteo ***********************************/
        
        @Get('meteo')
        async loadMeteo() {
            // return await this._meteo.getMeteo();
        }
        
        @Post('meteo')
        async saveLocation(@Body() req) {
            await this._meteo.addLocation(req.location);
        }
        
    }