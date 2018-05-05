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

    this.dataSocket = socketIo({ 'path': '/ws' });

    const jwt = this._authentication.getToken();
    this.dataSocket.emit('requestData', {jwt, data: { deveui, start: min, end: max }});

    this.dataSocket.on('responsetData', (res) => {
      this.dataObserver.next(res);
    });

    return new Observable(observer => {
      this.dataObserver = observer;
    });
  }

  getEvents(): Observable<any> {

    this.eventsSocket = socketIo({ 'path': '/ws' });

    const jwt = this._authentication.getToken();
    this.eventsSocket.emit('requestEvents', {jwt});

    this.eventsSocket.on('responseEvents', (res) => {
      this.eventsObserver.next(res);
    });

    return new Observable(observer => {
      this.eventsObserver = observer;
    });
  }

  private handleError(error) {
    console.error('server error:', error);
    if (error.error instanceof Error) {
        const errMessage = error.error.message;
        return Observable.throw(errMessage);
    }
    return Observable.throw(error || 'Socket.io server error');
  }

  disconnect() {
    this.dataSocket.disconnect();
  }

}
