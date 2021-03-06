import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import * as socketIo from 'socket.io-client';
import { Socket } from '../../../../../shared/interfaces/socket.interface';
import { AuthenticationService } from '../authentication.service/authentication.service';

@Injectable()
export class WsService {

  constructor(
    private _authentication: AuthenticationService,
  ) {}

  dataSocket: Socket;
  eventsSocket: Socket;
  dataObserver: Observer<any>;
  eventsObserver: Observer<any>;

  /**
   * @name getData
   * @param deveui string
   * @param min number
   * @param max numner
   * @description connects to the data ws server
   */
  getData(deveui: string, min: number, max: number): Observable<any> {

    this.dataSocket = socketIo({
      path: '/socket.io',
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

  /**
   * @name getEvents
   * @description connects to the events ws server
   */
  getEvents(): Observable<any> {

    this.eventsSocket = socketIo({
      path: '/socket.io',
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

  /**
   * @name disconnect
   * @description handles disconnection
   */
  disconnect() {
    this.dataSocket.disconnect();
  }

}
