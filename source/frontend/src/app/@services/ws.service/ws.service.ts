import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { map, catchError } from 'rxjs/operators';
import * as socketIo from 'socket.io-client';
import { Socket } from '../../@interfaces/socket.interface';

@Injectable()
export class WsService {

  dataSocket: Socket;
  eventsSocket: Socket;
  dataObserver: Observer<any>;
  eventsObserver: Observer<any>;

  getData(deveui: string, min, max): Observable<any> {

    this.dataSocket = socketIo({ 'path': '/ws' });

    this.dataSocket.emit('requestData', { deveui, start: min, end: max });

    this.dataSocket.on('responsetData', (res) => {
      this.dataObserver.next(res);
    });

    return new Observable(observer => {
      this.dataObserver = observer;
    });
  }

  getEvents(): Observable<any> {

    this.eventsSocket = socketIo({ 'path': '/ws' });

    this.eventsSocket.emit('requestEvents', {});

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
