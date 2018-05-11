import { Controller, Get, Post, Delete, Param, Query, Body, Res, Req, UseInterceptors, FileInterceptor, UploadedFile } from '@nestjs/common';
import { RealmService } from '../services/realm/realm.service';
import { GotthardpService } from '../services/gotthardp/gotthardp.service';
import { MeteoService } from '../services/meteo/meteo.service';
import { Gateway } from '../../../../shared/interfaces/gateway.interface';
import { Device } from '../../../../shared/interfaces/device.interface';
import { LoggerService } from '../services/logger/logger.service';
import { GeneratorService } from '../services/generator/generator.service';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';

// TODO: check async working
@Controller('api')
export class APIController {
    constructor(private readonly _realm: RealmService,
        private readonly _gotthardp: GotthardpService,
        private readonly _meteo: MeteoService,
        private readonly _logger: LoggerService,
        private readonly _generator: GeneratorService) {}
        
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
        
        @Get('ino/:deveui')
        async getINO(@Param() param, @Res() res) {
            const self = this;
            let filePath = await this._generator.genFile(param.deveui);
            res.download(filePath, function(err){
                if (err) {
                    self._logger.error(err);
                }
            });
        }
        
        /**
        * @name removeDevice
        * @param param 
        * @description removes the device from the gotthardp server and the realm DB
        */
        @Delete('device/:deveui')
        async removeDevice(@Param() param, @Res() res) {
            try {
                await this._gotthardp.removeDevice(param.deveui);
                await this._realm.removeDevice(param.deveui);
                this._logger.success('device ' + param.deveui + ' removed');
                res.send({ status: 'OK' });
              } catch (error) {
                this._logger.error(error);
              }
        }
        
        @Get('data/:query?')
        async getData(@Query() params) {
            return await this._realm.getSensorData(params);
        }

        @Get('csv/:deveui')
        async getCSV(@Param() param, @Res() res) {
            const self = this;
            let filePath = await this._generator.genCSV(param.deveui);
            res.download(filePath, function(err){
                if (err) {
                    self._logger.error(err);
                }
            });
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

        @Get('konva/image')
        async getFile(@Param() param, @Res() res) {
            const self = this;
            let filePath = './src/blob/plan.png';
            res.download(filePath, function(err){
                if (err) {
                    self._logger.error(err);
                }
            });
        }

        @Post('konva/image')
        @UseInterceptors(FileInterceptor('file', { dest: './' }))
        uploadFile(@UploadedFile() file) {
            const self = this;
            const oldpath = file.path;
            const newpath = './src/blob/plan.png';
            fs.rename(oldpath, newpath, function (err) {
                if (err) {
                    console.log(err);
                }
            });
        }
        
        /*********************************** meteo ***********************************/
        
        @Get('meteo')
        async loadMeteo() {
            // return await this._meteo.getMeteo();
        }

        @Get('meteo/locations')
        async getLocations() {
            return await this._realm.getLocations();
        }
        
        @Post('meteo')
        async saveLocation(@Body() req) {
            await this._meteo.addLocation(req.location);
        }

        @Delete('meteo/:location')
        async removeLocation(@Param() param, @Res() res) {
            try {
                await this._realm.removeLocation(param.location);
                res.send({ status: 'OK' });
              } catch (error) {
                this._logger.error(error);
              }
        }
        
    }