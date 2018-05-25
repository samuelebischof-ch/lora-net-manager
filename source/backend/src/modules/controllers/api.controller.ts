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
              private readonly _generator: GeneratorService,
  ) {}

  /********************************* gateways ********************************/

  /**
  * @name getGateways
  * @returns returns the list of gateways registered to gotthardp
  */
  @Get('gateways')
  async getGateways() {
    const gateways = await this._gotthardp.getGateways();
    const outGateways = [];
    for (const g of gateways) {
      const gateway = {} as Gateway;
      gateway.mac = g.mac;
      gateway.desc = g.desc;
      gateway.last_alive = g.last_alive;
      gateway.ip_address = g.ip_address;
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
    try {
      await this._gotthardp.addGateway(req);
    } catch (error) {
      this._logger.error(error);
    }
  }

  /**
  * @name removeGateway
  * @param param { mac: string }
  * @description removes the gateway from the LoRaServer
  */
  @Delete('gateway/:mac')
  async removeGateway(@Param() param) {
    try {
      await this._gotthardp.removeGateway(param.mac);
    } catch (error) {
      this._logger.error(error);
    }
    this._logger.success('gateway ' + param.mac + ' removed');
  }

  /********************************** device *********************************/

  /**
  * @name getDevices
  * @returns a list of devices
  * @description sends the list of devices registered to gotthardp
  * to the frontend angular application.
  */
  @Get('devices')
  async getDevices() {
    try {
      const devices = await this._gotthardp.getDevices();
      const outDevices = [];
      for (const d of devices) {
        const device = {} as Device;
        device.appeui = d.appeui;
        device.appkey = d.appkey;
        device.deveui = d.deveui;
        device.desc = d.desc;
        device.room = await this._realm.getDeviceRoom(d.deveui);
        device.last_join = d.last_join;
        outDevices.push(device);
      }
      return outDevices;
    } catch (error) {
      this._logger.error(error);
    }
  }

  /**
  * @name getDevicesByRoom
  * @returns a list of devices grouped by room
  */
  @Get('devicesbyroom')
  async getDevicesByRoom() {
    try {
      return await this._realm.getDevicesByRoom();
    } catch (error) {
      this._logger.error(error);
    }
  }

  /**
  * @name addDevice
  * @param req holds the informations of the new device
  * @description adds a device to the LoRaServer
  */
  @Post('device')
  async addDevice(@Body() req) {
    try {
      await this._realm.createDevice(req);
    } catch (error) {
      this._logger.error(error);
    }
    try {
      await this._gotthardp.addDevice(req);
    } catch (error) {
      this._logger.error(error);
    }
  }

  /**
  * @name removeDevice
  * @param param { deveui: string }
  * @param res express response
  * @description removes the device from the LoRaWAN server and the realm DB
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

  /**
  * @name getINO
  * @param param { deveui: string }
  * @param res express response
  * @description returns an *.ino file with the correct LoRaWAN keys
  */
  @Get('ino/:deveui')
  async getINO(@Param() param, @Res() res) {
    const self = this;
    try {
      const filePath = await this._generator.genFile(param.deveui);
      res.download(filePath, (err) => {
        if (err) {
          self._logger.error(err);
        }
      });
      this._generator.deleteFile(filePath);
    } catch (error) {
      this._logger.error(error);
    }
  }

  /**
  * @name getData
  * @param params
  * @returns the sensor readings of a given device
  */
  @Get('data/:query?')
  async getData(@Query() params) {
    try {
      return await this._realm.getSensorData(params);
    } catch (error) {
      this._logger.error(error);
    }
  }

  /**
  * @name getCSV
  * @param param { deveui: string }
  * @param res express response
  * @returns a *.csv file with all the sensor readigns of the device
  */
  @Get('csv/:deveui')
  async getCSV(@Param() param, @Res() res) {
    const self = this;
    try {
      const filePath = await this._generator.genCSV(param.deveui);
      res.download(filePath, (err) => {
        if (err) {
          self._logger.error(err);
        }
      });
      // this._generator.deleteFile(filePath);
    } catch (error) {
      this._logger.error(error);
    }
  }

  /**
  * @name getDevEUI
  * @returns a randomly generated DevEUI
  */
  @Get('gendeveui')
  async getDevEUI() {
    return { deveui: crypto.randomBytes(8).toString('hex') };
  }

  /**
  * @name getDevaddr
  * @returns a randomly generated Devaddr
  */
  @Get('gendevaddr')
  async getDevaddr() {
    return { devaddr: crypto.randomBytes(4).toString('hex') };
  }

  /*********************************** konva *********************************/

  /**
  * @name loadKonva
  * @returns the saved konva canvas from Realm BD
  */
  @Get('konva')
  async loadKonva() {
    return await this._realm.loadKonva();
  }

  /**
  * @name saveKonva
  * @param data konva canvas
  * @description saves the serialized konva canvas to Realm DB
  */
  @Post('konva')
  async saveKonva(@Body() data) {
    await this._realm.saveKonva(data);
  }

  /**
  * @name getFile
  * @param res express response
  * @returns the map background image
  */
  @Get('konva/image')
  async getFile(@Res() res) {
    const self = this;
    const filePath = './src/blob/plan.png';
    res.download(filePath, (err) => {
      if (err) {
        self._logger.error(err);
      }
    });
  }

  /**
  * @name uploadFile
  * @param file konva bacgkground image
  * @description saves the image to blob
  */
  @Post('konva/image')
  @UseInterceptors(FileInterceptor('file', { dest: './' }))
  uploadFile(@UploadedFile() file) {
    const self = this;
    const oldpath = file.path;
    const newpath = './src/blob/plan.png';
    fs.rename(oldpath, newpath, (error) => {
      if (error) {
        // this._logger.error(error);
      }
    });
  }

  /********************************** meteo **********************************/

  /**
  * @name getLocations
  * @returns the list of locations saved to settings in Realm DB
  */
  @Get('meteo/locations')
  async getLocations() {
    return await this._realm.getLocations();
  }

  /**
  * @name saveLocation
  * @param req
  * @description saves the new location
  * - to settings
  * - as a device
  */
  @Post('meteo')
  async saveLocation(@Body() req) {
    await this._meteo.addLocation(req.location);
  }

  /**
  * @name removeLocation
  * @param param { location: string }
  * @param res express response
  * @description removes a location from devices and settings
  */
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