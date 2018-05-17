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

  getGateways() {
    this._api.getGateways().subscribe(data => {
      this.gateways = data;
    });
  }

  isMAC(h: string): Boolean {
    const re = /[0-9A-Fa-f]{16}/g;
    return (h.length === 16 && re.test(h));
  }

  ngOnInit() {
    this.getGateways();
  }

}
