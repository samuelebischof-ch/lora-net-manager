import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../@services/api.service/api.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-gateways',
  templateUrl: './gateways.component.html',
  styleUrls: ['./gateways.component.scss']
})
export class GatewaysComponent implements OnInit {

  public gateways: any;
  public mac = '';
  public panelOpenState: boolean;

  constructor(
    private _api: ApiService,
    public snackBar: MatSnackBar,
  ) { }

  /**
   * @name createGateway
   * @description creates a new gateway in the backend
   */
  createGateway() {
    if (this.isMAC(this.mac)) {
      this._api.addGateway(this.mac).subscribe(res => this.getGateways());
      this.snackBar.open('Gateway ' + this.mac + ' added', 'Close', {
        duration: 3000
      });
      this.mac = '';
    } else {
      this.snackBar.open('MAC address wrong format', 'Close', {
        duration: 3000
      });
    }
  }

  /**
   * @name getGateways
   * @description asks the server for a list of gateways
   */
  getGateways() {
    this._api.getGateways().subscribe(data => {
      this.gateways = data;
    });
  }

  /**
   * @name isMac
   * @param macT string
   * @return true if macT is in the right format
   */
  isMAC(macT: string): Boolean {
    const re = /[0-9A-Fa-f]{16}/g;
    return (macT.length === 16 && re.test(macT));
  }

  ngOnInit() {
    this.getGateways();
  }

}
