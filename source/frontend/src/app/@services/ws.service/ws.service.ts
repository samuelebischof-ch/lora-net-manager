import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { map, catchError } from 'rxjs/operators';
import * as socketIo from 'socket.io-client';
import { Socket } from '../../@interfaces/socket.interface';
import { AuthenticationService } from '../authentication.service/authentication.service';

@Injectable()
export class WsService {

  constructor(private _authentication: AuthenticationService) {

  }

  dataSocket: Socket;
  eventsSocket: Socket;
  dataObserver: Observer<any>;
  eventsObserver: Observer<any>;

  getData(deveui: string, min, max): Observable<any> {

    this.dataSocket = socketIo({
      path: '/wss',
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax : 5000,
      reconnectionAttempts: Infinity
    });

    const jwt = this._authentication.getToken();

    this.dataSocket.on('connect', () => {
      this.dataSocket.emit('requestData', {jwt, data: { deveui, start: min, end: max }});
    });

    this.dataSocket.on('responsetData', (res) => {
      this.dataObserver.next(res);
    });

    return new Observable(observer => {
      this.dataObserver = observer;
    });
  }

  getEvents(): Observable<any> {

    this.eventsSocket = socketIo({
      path: '/wss',
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax : 5000,
      reconnectionAttempts: Infinity
    });

    const jwt = this._authentication.getToken();

    this.eventsSocket.on('connect', () => {
      this.eventsSocket.emit('requestEvents', {jwt});
    });

    this.eventsSocket.on('responseEvents', (res) => {
      this.eventsObserver.next(res);
    });

    return new Observable(observer => {
      this.eventsObserver = observer;
    });
  }

  disconnect() {
    this.dataSocket.disconnect();
  }

}
