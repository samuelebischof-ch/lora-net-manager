import { Injectable } from '@angular/core';
import { WsService } from '../ws.service/ws.service';
import { AuthenticationService } from '../authentication.service/authentication.service';
import { MatSnackBar } from '@angular/material';
import { delay } from '../../@helpers/helpers';

@Injectable()
export class NotificationsService {

  constructor(private _ws: WsService,
    private _authentication: AuthenticationService,
    public snackBar: MatSnackBar
  ) {}

  async connectEvents() {
    this.checkAndConnect();
    while (!this._authentication.isAuthenticated()) {
      console.log('Not authenticated');
      await delay(1000);
      await this.checkAndConnect();
    }
  }

  // TODO: force reconnection
  async checkAndConnect() {
    if (this._authentication.isAuthenticated()) {
      console.log('Authenticated');
      this._ws.getEvents().subscribe(res => {
        console.log(res);
        this.snackBar.open(res.deveui + ' ' + res.event, 'Close');
      });
    }
  }

}
