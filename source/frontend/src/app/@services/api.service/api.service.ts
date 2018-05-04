import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { SensorData } from '../../@interfaces/sensor-data';

@Injectable()
export class ApiService {

  private accessToken = '';
  private isAuthenticated = false;

  constructor(private _http: HttpClient) { }

  /********************************** gateways *********************************/

  getGateways() {
    return this._http.get('/api/gateways', {
      headers: new HttpHeaders().set('Authorization', 'bearer ' + this.accessToken)
    });
  }

  addGateway(mac: string) {
    return this._http.post('/api/gateway/', { mac }, {
      headers: new HttpHeaders().set('Authorization', 'bearer ' + this.accessToken)
      .append('Content-Type', 'application/json')
    });
  }

  removeGateway(mac: string) {
    return this._http.delete('/api/gateway/' + mac, {
      headers: new HttpHeaders().set('Authorization', 'bearer ' + this.accessToken)
    }).subscribe();
  }

  /********************************** device *********************************/

  getDevices() {
    return this._http.get('/api/devices', {
      headers: new HttpHeaders().set('Authorization', 'bearer ' + this.accessToken)
    });
  }

  getDevicesByRoom() {
    return this._http.get('/api/devicesbyroom', {
      headers: new HttpHeaders().set('Authorization', 'bearer ' + this.accessToken)
    });
  }

  addDevice(options) {
    return this._http.post('/api/device/', options, {
      headers: new HttpHeaders().set('Authorization', 'bearer ' + this.accessToken)
      .append('Content-Type', 'application/json')
    });
  }

  removeDevice(deveui: string) {
    return this._http.delete('/api/device/' + deveui, {
      headers: new HttpHeaders().set('Authorization', 'bearer ' + this.accessToken)
    }).subscribe();
  }

  async getData(deveui: string, min: number, max: number): Promise<any> {
    const response = await this._http.get('/api/data?deveui=' + deveui + '&start=' + min + '&end=' + max, {
      headers: new HttpHeaders().set('Authorization', 'bearer ' + this.accessToken)
      .append('Content-Type', 'application/json')
    }).toPromise();
    return response;
  }

  getDEVEUI() {
    return this._http.get('/api/gendeveui/', {
      headers: new HttpHeaders().set('Authorization', 'bearer ' + this.accessToken)
      .append('Content-Type', 'application/json')
    });
  }

  getDEVADDR() {
    return this._http.get('/api/gendevaddr/', {
      headers: new HttpHeaders().set('Authorization', 'bearer ' + this.accessToken)
      .append('Content-Type', 'application/json')
    });
  }

  /********************************** konva **********************************/

  loadKonva() {
    return this._http.get('/api/konva/', {
      headers: new HttpHeaders().set('Authorization', 'bearer ' + this.accessToken)
      .append('Content-Type', 'application/json')
    });
  }

  saveKonva(data) {
    return this._http.post('/api/konva/', data, {
      headers: new HttpHeaders().set('Authorization', 'bearer ' + this.accessToken)
      .append('Content-Type', 'application/json')
    });
  }

  /********************************** meteo **********************************/

  getMeteo() {
    return this._http.get('/api/meteo/', {
      headers: new HttpHeaders().set('Authorization', 'bearer ' + this.accessToken)
      .append('Content-Type', 'application/json')
    });
  }

  saveLocation(location) {
    return this._http.post('/api/meteo/', { location }, {
      headers: new HttpHeaders().set('Authorization', 'bearer ' + this.accessToken)
      .append('Content-Type', 'application/json')
    });
  }

  /******************************* authentication ******************************/

  login(username: string, secret: string) {
    return this._http.post('/auth/token/', {username, secret})
    .map(result => result as any);
  }

  saveAccessToken(token: string) {
    this.accessToken = token;
  }

  setIsAuthenticated(authenticated: boolean) {
    this.isAuthenticated = authenticated;
  }

  checkIsAuthenticated() {
    return this.isAuthenticated;
  }

}
