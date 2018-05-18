import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { saveAs } from 'file-saver/FileSaver';

import { SensorData } from '../../../../../shared/interfaces/sensor-data';
import { AuthenticationService } from '../authentication.service/authentication.service';
import { Auth } from '../../../../../shared/interfaces/auth.interface';

@Injectable()
export class ApiService {

  constructor(private _http: HttpClient,
              private _authentication: AuthenticationService) { }

  /********************************** gateways *********************************/

  /**
   * @name getGateways
   * @description gets a list of gateways from the backend
   */
  getGateways() {
    if (this._authentication.isAuthenticated()) {
      return this._http.get('/api/gateways', {
        headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken())
      });
    }
  }

  /**
   * @name addGateway
   * @param mac string
   * @description posts a new gateway to the backend
   */
  addGateway(mac: string) {
    if (this._authentication.isAuthenticated()) {
      return this._http.post('/api/gateway/', { mac }, {
        headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken())
        .append('Content-Type', 'application/json')
      });
    }
  }

  /**
   * @name removeGateway
   * @param mac string
   * @description removes a gateway from the backend
   */
  removeGateway(mac: string) {
    if (this._authentication.isAuthenticated()) {
      return this._http.delete('/api/gateway/' + mac, {
        headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken())
      }).subscribe();
    }
  }

  /********************************** device *********************************/

  /**
   * @name getDevices
   * @description asks for a list of devices to the backend
   */
  getDevices() {
    if (this._authentication.isAuthenticated()) {
      return this._http.get('/api/devices', {
        headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken())
      });
    }
  }

  /**
   * @name getDevicesByRoom
   * @description asks for a list of devices divided by room to the backend
   */
  getDevicesByRoom() {
    if (this._authentication.isAuthenticated()) {
      return this._http.get('/api/devicesbyroom', {
        headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken())
      });
    }
  }

  /**
   * @name addDevice
   * @param options
   * @description posts a new device to the backend
   */
  addDevice(options) {
    if (this._authentication.isAuthenticated()) {
      return this._http.post('/api/device/', options, {
        headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken())
        .append('Content-Type', 'application/json')
      });
    }
  }

  /**
   * @name getDeviceINO
   * @param deveui string
   * @description gets an INO file from the backend
   */
  async getDeviceINO(deveui: string) {
    if (this._authentication.isAuthenticated()) {
    const file = await this._http.get<Blob>(
      '/api/ino/' + deveui, {
        headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken()),
        responseType: 'blob' as 'json'
      }).toPromise();
        saveAs(file, 'otaa.ino');
      }
  }

  /**
   * @name removeDevice
   * @param deveui string
   * @description removes device deveui from the backend
   */
  removeDevice(deveui: string) {
    if (this._authentication.isAuthenticated()) {
      return this._http.delete('/api/device/' + deveui, {
        headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken())
      });
    }
  }

  /**
   * @name getData
   * @param deveui string
   * @param min number
   * @param max number
   * @description gets data from server in range min max
   */
  async getData(deveui: string, min: number, max: number): Promise<any> {
    if (this._authentication.isAuthenticated()) {
      const response = await this._http.get('/api/data?deveui=' + deveui + '&start=' + min + '&end=' + max, {
        headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken())
        .append('Content-Type', 'application/json')
      }).toPromise();
      return response;
    }
  }

  /**
   * @name getDataCSV
   * @param deveui string
   * @description gets a CSV with all sensor data from the backend
   */
  async getDataCSV(deveui: string) {
    if (this._authentication.isAuthenticated()) {
    const file = await this._http.get<Blob>(
      '/api/csv/' + deveui, {
        headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken()),
        responseType: 'blob' as 'json'
      }).toPromise();
        saveAs(file, deveui + '.csv');
      }
  }

  /**
   * @name getDEVEUI
   * @returns a nen DEVEUI
   * @description asks the backend for a new DEVEUI
   */
  getDEVEUI() {
    if (this._authentication.isAuthenticated()) {
      return this._http.get('/api/gendeveui/', {
        headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken())
        .append('Content-Type', 'application/json')
      });
    }
  }

  /**
   * @name getDEVADDR
   * @returns a nen DEVADDR
   * @description asks the backend for a new DEVADDR
   */
  getDEVADDR() {
    if (this._authentication.isAuthenticated()) {
      return this._http.get('/api/gendevaddr/', {
        headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken())
        .append('Content-Type', 'application/json')
      });
    }
  }

  /********************************** konva **********************************/

  /**
   * @name loadKonva
   * @return konva serialize canvas
   * @description askt tha backend for the konva object
   */
  loadKonva() {
    if (this._authentication.isAuthenticated()) {
      return this._http.get('/api/konva/', {
        headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken())
        .append('Content-Type', 'application/json')
      });
    }
  }

  /**
   * @name saveKonva
   * @param data
   * @description posts konva to server
   */
  saveKonva(data) {
    if (this._authentication.isAuthenticated()) {
      return this._http.post('/api/konva/', data, {
        headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken())
        .append('Content-Type', 'application/json')
      });
    }
  }

  /**
   * @name uploadImage
   * @param uploadData
   * @description posts an image to the server
   */
  uploadImage(uploadData) {
    return this._http.post('/api/konva/image', uploadData, {
      headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken())
    });
  }

  /**
   * @name downloadImage
   * @returns a blob
   * @description gets an image from server
   */
  downloadImage() {
    return this._http.get('/api/konva/image', {
      headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken()),
      responseType: 'blob',
    });
  }

  /********************************** meteo **********************************/

  /**
   * @
   */
  getLocations() {
    if (this._authentication.isAuthenticated()) {
      return this._http.get('/api/meteo/locations/', {
        headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken())
        .append('Content-Type', 'application/json')
      });
    }
  }

  /**
   * @name location
   * @param location string
   * @description posts a new location to server
   */
  saveLocation(location: string) {
    if (this._authentication.isAuthenticated()) {
      return this._http.post('/api/meteo/', { location }, {
        headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken())
        .append('Content-Type', 'application/json')
      });
    }
  }

  /**
   * @name removeLocation
   * @param location string
   * @description removes a location from the backend
   */
  removeLocation(location: string) {
    if (this._authentication.isAuthenticated()) {
      return this._http.delete('/api/meteo/' + location, {
        headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken())
      });
    }
  }

  /******************************* authentication ******************************/

  /**
   * @name login
   * @description logins to the backend
   */
  async login(username: string, secret: string) {
      await this._http.post('/auth/token/', {username, secret})
      .subscribe( async res => {
        this._authentication.authenticate(res as Auth);
      });
  }

}
