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

  /**
   * @name removeDevice
   * @description removes the device from the server
   */
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

  /**
   * @name getINO
   * @description asks the server to generate the INO file
   */
  getINO() {
    this._api.getDeviceINO(this.device.deveui);
  }

  /**
   * @name getCSV
   * @description asks the server to generate a CSV with all sensor data
   */
  getCSV() {
    this._api.getDataCSV(this.device.deveui);
  }

}
