import { Component } from '@nestjs/common';
import { RealmService } from '../realm/realm.service';
import { LoggerService } from '../logger/logger.service';
import { DataWS } from '../../../../../shared/interfaces/dataWS.interface';
import * as request from 'request';
import * as rp from 'request-promise-native';

@Component()
export class MeteoService {

  constructor(
    private readonly _realm: RealmService,
    private readonly _logger: LoggerService,
  ) {}

  /**
   * @name addLocation
   * @param locationName
   * @description ads a location to Realm DB
   */
  async addLocation(locationName: string) {
    await this._realm.saveLocation(locationName);
  }

  /**
   * @name getMeteo
   * @returns a Promise of the meteo
   */
  async getMeteo(): Promise<any> {
    this._logger.print('getMeteo');
    const locationData = await this._realm.getLocations();
    const apikey = locationData.apikey;
    const arrayMeteo = [];
    for (const location of locationData.locations) {
      const urlOptions = {
        url: 'http://api.openweathermap.org/data/2.5/weather?q=',
        method: 'GET',
      };
      urlOptions.url += location;
      urlOptions.url += '&appid=';
      urlOptions.url += apikey;
      urlOptions.url += '&units=metric';

      try {
        const meteo = await rp(urlOptions);
        arrayMeteo.push(JSON.parse(meteo));
      } catch (error) {
        this._logger.error('ERROR at getGateways(): ' + error);
      }
    }
    return arrayMeteo;
  }

  async meteoLogging() {
    const run = true;
    while (run) {
      const meteo = await this.getMeteo();
      this._logger.print(meteo);
      for (const element of meteo) {
        const msg = {} as DataWS;
        msg.datetime = new Date(Date.now());
        msg.deveui = element.name;
        msg.field1 = element.main.temp;
        msg.field2 = element.main.pressure;
        msg.field3 = element.main.humidity;
        this._realm.storeSensorData(msg);
      }
      const sec = 1000;
      const min = 60 * sec;
      await this.delay(2 * min);
    }
  }

  /**
  * @name delay
  * @param ms: time in milliseconds
  * @description returns a Promise of a timeout
  */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}