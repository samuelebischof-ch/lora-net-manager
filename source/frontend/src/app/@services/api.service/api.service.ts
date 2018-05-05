import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { SensorData } from '../../@interfaces/sensor-data';
import { AuthenticationService } from '../authentication.service/authentication.service';
import { Auth } from '../../@interfaces/auth.interface';

@Injectable()
export class ApiService {

  constructor(private _http: HttpClient,
              private _authentication: AuthenticationService) { }

  /********************************** gateways *********************************/

  getGateways() {
    if (this._authentication.isAuthenticated()) {
      return this._http.get('/api/gateways', {
        headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken())
      });
    }
  }

  addGateway(mac: string) {
    if (this._authentication.isAuthenticated()) {
      return this._http.post('/api/gateway/', { mac }, {
        headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken())
        .append('Content-Type', 'application/json')
      });
    }
  }

  removeGateway(mac: string) {
    if (this._authentication.isAuthenticated()) {
      return this._http.delete('/api/gateway/' + mac, {
        headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken())
      }).subscribe();
    }
  }

  /********************************** device *********************************/

  getDevices() {
    if (this._authentication.isAuthenticated()) {
      return this._http.get('/api/devices', {
        headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken())
      });
    }
  }

  getDevicesByRoom() {
    if (this._authentication.isAuthenticated()) {
      return this._http.get('/api/devicesbyroom', {
        headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken())
      });
    }
  }

  addDevice(options) {
    if (this._authentication.isAuthenticated()) {
      return this._http.post('/api/device/', options, {
        headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken())
        .append('Content-Type', 'application/json')
      });
    }
  }

  removeDevice(deveui: string) {
    if (this._authentication.isAuthenticated()) {
      return this._http.delete('/api/device/' + deveui, {
        headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken())
      }).subscribe();
    }
  }

  async getData(deveui: string, min: number, max: number): Promise<any> {
    if (this._authentication.isAuthenticated()) {
      const response = await this._http.get('/api/data?deveui=' + deveui + '&start=' + min + '&end=' + max, {
        headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken())
        .append('Content-Type', 'application/json')
      }).toPromise();
      return response;
    }
  }

  getDEVEUI() {
    if (this._authentication.isAuthenticated()) {
      return this._http.get('/api/gendeveui/', {
        headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken())
        .append('Content-Type', 'application/json')
      });
    }
  }

  getDEVADDR() {
    if (this._authentication.isAuthenticated()) {
      return this._http.get('/api/gendevaddr/', {
        headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken())
        .append('Content-Type', 'application/json')
      });
    }
  }

  /********************************** konva **********************************/

  loadKonva() {
    if (this._authentication.isAuthenticated()) {
      return this._http.get('/api/konva/', {
        headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken())
        .append('Content-Type', 'application/json')
      });
    }
  }

  saveKonva(data) {
    if (this._authentication.isAuthenticated()) {
      return this._http.post('/api/konva/', data, {
        headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken())
        .append('Content-Type', 'application/json')
      });
    }
  }

  /********************************** meteo **********************************/

  getMeteo() {
    if (this._authentication.isAuthenticated()) {
      return this._http.get('/api/meteo/', {
        headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken())
        .append('Content-Type', 'application/json')
      });
    }
  }

  saveLocation(location) {
    if (this._authentication.isAuthenticated()) {
      return this._http.post('/api/meteo/', { location }, {
        headers: new HttpHeaders().set('Authorization', 'bearer ' + this._authentication.getToken())
        .append('Content-Type', 'application/json')
      });
    }
  }

  /******************************* authentication ******************************/

  async login(username: string, secret: string) {
      await this._http.post('/auth/token/', {username, secret})
      .subscribe( async res => {
        this._authentication.authenticate(res as Auth);
      });
  }

}
