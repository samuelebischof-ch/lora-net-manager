import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ApiService } from '../../../@services/api.service/api.service';
import { MatSnackBar } from '@angular/material';
import { Gateway } from '../../../@interfaces/gateway.interface';

@Component({
  selector: 'app-gateway',
  templateUrl: './gateway.component.html',
  styleUrls: ['./gateway.component.scss']
})
export class GatewayComponent implements OnInit {

  @Input() gateway: Gateway;
  @Output() valuesChanged = new EventEmitter();

  constructor(private _api: ApiService,
              public snackBar: MatSnackBar) { }

  removeGateway() {
    const r = confirm('Confirm deletion!');
    if (r === true) {
      this._api.removeGateway(this.gateway.mac);
      this.valuesChanged.emit();
      this.snackBar.open('Gateway removed', 'Close', {
        duration: 3000
      });
    }
  }

  ngOnInit() {
    if (this.gateway.last_alive === undefined) {
      this.gateway.last_alive = 'never';
    }
    if (this.gateway.ip_address === undefined) {
      this.gateway.ip_address = { ip: '0.0.0.0',
                                  port: undefined,
                                  ver: undefined };
    }
  }

}
