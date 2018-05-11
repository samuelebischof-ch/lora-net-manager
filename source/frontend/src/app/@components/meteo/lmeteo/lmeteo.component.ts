import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ApiService } from '../../../@services/api.service/api.service';
import { MatSnackBar } from '@angular/material';
import { Gateway } from '../../../../../../shared/interfaces/gateway.interface';

@Component({
  selector: 'app-lmeteo',
  templateUrl: './lmeteo.component.html',
  styleUrls: ['./lmeteo.component.scss']
})
export class LmeteoComponent implements OnInit {

  @Input() location: string;
  @Output() valuesChanged = new EventEmitter();

  constructor(private _api: ApiService,
              public snackBar: MatSnackBar) { }

  removeLocation() {
    const r = confirm('Confirm deletion!');
    if (r === true) {
      this._api.removeLocation(this.location);
      this.valuesChanged.emit();
      this.snackBar.open('Location removed', 'Close', {
        duration: 3000
      });
    }
  }

  ngOnInit() {
    // if (this.gateway.last_alive === undefined) {
    //   this.gateway.last_alive = 'never';
    // }
    // if (this.gateway.ip_address === undefined) {
    //   this.gateway.ip_address = { ip: '0.0.0.0',
    //                               port: undefined,
    //                               ver: undefined };
    // }
  }

}
