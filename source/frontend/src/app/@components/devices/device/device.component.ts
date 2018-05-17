import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { ApiService } from '../../../@services/api.service/api.service';
import { Device } from '../../../../../../shared/interfaces/device.interface';

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.scss']
})
export class DeviceComponent {

  @Input() device: Device;
  @Output() valuesChanged = new EventEmitter();

  constructor(
    private _api: ApiService,
    public snackBar: MatSnackBar,
  ) { }

  removeDevice() {
    const r = confirm('Confirm deletion!');
    if (r === true) {
      this._api.removeDevice(this.device.deveui).subscribe(res => {
        this.valuesChanged.emit();
        this.snackBar.open('Node removed', 'Close', {
          duration: 3000
        });
      });
    }
  }

  getINO() {
    this._api.getDeviceINO(this.device.deveui);
  }

  getCSV() {
    this._api.getDataCSV(this.device.deveui);
  }

}
