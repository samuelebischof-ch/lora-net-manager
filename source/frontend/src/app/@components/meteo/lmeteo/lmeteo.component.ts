import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiService } from '../../../@services/api.service/api.service';
import { MatSnackBar } from '@angular/material';
import { Gateway } from '../../../../../../shared/interfaces/gateway.interface';

@Component({
  selector: 'app-lmeteo',
  templateUrl: './lmeteo.component.html',
  styleUrls: ['./lmeteo.component.scss']
})
export class LmeteoComponent {

  @Input() location: string;
  @Output() valuesChanged = new EventEmitter();

  constructor(
    private _api: ApiService,
    public snackBar: MatSnackBar,
  ) { }

  /**
   * @name removeLocation
   * @description removes a location from the backend
   */
  removeLocation() {
    const r = confirm('Confirm deletion!');
    if (r === true) {
      this._api.removeLocation(this.location).subscribe(res => {
        this.valuesChanged.emit();
        this.snackBar.open('Location removed', 'Close', {
          duration: 3000
        });
      });
    }
  }

  /**
   * @name getCSV
   * @description asks the server to generate a CSV with all sensor data
   */
  getCSV() {
    this._api.getDataCSV(this.location);
  }

}
