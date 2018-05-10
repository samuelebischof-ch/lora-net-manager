import { Injectable } from '@angular/core';
import { WsService } from '../ws.service/ws.service';
import { AuthenticationService } from '../authentication.service/authentication.service';
import { MatSnackBar } from '@angular/material';
import { delay } from '../../@helpers/helpers';
import { SwPush } from '@angular/service-worker';

@Injectable()
export class NotificationsService {

  readonly VAPID_PUBLIC_KEY =  'BGD4aWIT3MZUKkTplneabA0teALU2pATr4XgvwPcfoekzo21LFWtdrSe_CehSMA1ch-DJJslQmW79fzRSbSFn9E'

  constructor(private _ws: WsService,
    private _authentication: AuthenticationService,
    public snackBar: MatSnackBar,
    private swPush: SwPush,
  ) {}

  subscribeToNotifications() {

    this.swPush.requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY
    })
    .then(sub => console.log())
    .catch(err => console.error('Could not subscribe to notifications', err));
  }

  async connectEvents() {
    this.checkAndConnect();
    while (!this._authentication.isAuthenticated()) {
      await delay(1000);
      await this.checkAndConnect();
    }
  }

  // TODO: force reconnection
  async checkAndConnect() {
    if (this._authentication.isAuthenticated()) {
      this.subscribeToNotifications();
      this._ws.getEvents().subscribe(res => {
        console.log(res);
        this.snackBar.open(res.deveui + ' ' + res.event, 'Close');
      });
    }
  }

}
