import { Component } from '@nestjs/common';
import { RealmService } from '../realm/realm.service';
import * as request from 'request';
import * as rp from 'request-promise-native';
import { DataWS } from '../../../../../shared/interfaces/dataWS.interface';

@Component()
export class MeteoService {
    constructor(private readonly _realm: RealmService) {}
    
    async addLocation(locationName: string) {
        await this._realm.saveLocation(locationName);
    }
    
    async getMeteo(): Promise<any> {
        const locationData = await this._realm.getLocations();
        const apikey = locationData.apikey;
        const arrayMeteo = [];
        if (locationData.locations.length > 0) {
            for (let key in locationData.locations) {
                const location = locationData.locations[key];
                const urlOptions = {
                    url: 'http://api.openweathermap.org/data/2.5/weather?q=',
                    method: 'GET',
                }
                urlOptions.url += location;
                urlOptions.url += '&appid='
                urlOptions.url += apikey;
                urlOptions.url += '&units=metric';
                try {
                    const meteo = await rp(urlOptions);
                    arrayMeteo.push(JSON.parse(meteo));
                } catch (err) {
                    console.error('ERROR at getGateways(): ' + err);
                }
            }
        }
        return arrayMeteo;
    }
    
    async meteoLogging() {
        const meteo = await this.getMeteo();
        meteo.forEach(element => {
            const msg = {} as DataWS;
            msg.datetime = new Date(Date.now());
            msg.deveui = element.name;
            msg.field1 = element.main.temp;
            msg.field2 = element.main.pressure;
            msg.field3 = element.main.humidity;
            this._realm.storeSensorData(msg);
        });
        await this.delay(90000);
        this.meteoLogging();
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