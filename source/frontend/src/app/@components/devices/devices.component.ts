import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../@services/api.service/api.service';
import { MatSnackBar } from '@angular/material';
import { DeviceDB, Room, DataSheet } from '../../../../../shared/interfaces/deviceDB.interface';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.scss']
})
export class DevicesComponent implements OnInit {

  public devices: any;
  public deveui = '';
  public devaddr = '';
  public room = new Room();
  public desc = '';
  public model = '';
  public dataSheet = new DataSheet();

  public panelOpenState: boolean;

  constructor(
    private _api: ApiService,
    public snackBar: MatSnackBar,
  ) { }

  addDevice() {
    if (this.isDEVEUI(this.deveui) && this.isDEVADDR(this.devaddr)) {
      const device = new DeviceDB();
      device.room = this.room;
      device.desc = this.desc;
      device.model = this.model;
      device.deveui = this.deveui;
      device.devaddr = this.devaddr;
      device.data_sheet = this.dataSheet;
      this._api.addDevice(device).subscribe(res => this.getDevices());
      this.snackBar.open('Device ' + this.deveui + ' added', 'Close', {
        duration: 3000
      });
      this.genDEVEUI();
      this.genDEVADDR();
    } else {
      this.snackBar.open('Wrong format', 'Close', {
        duration: 3000
      });
    }
  }

  getDevices() {
    this._api.getDevices().subscribe(data => {
      this.devices = data;
    });
  }

  isDEVEUI(h: string): Boolean {
    const re = /[0-9A-Fa-f]{16}/g;
    return (h.length === 16 && re.test(h));
  }

  isDEVADDR(h: string): Boolean {
    const re = /[0-9A-Fa-f]{8}/g;
    return (h.length === 8 && re.test(h));
  }

  genDEVEUI() {
    this._api.getDEVEUI().subscribe(res => {
      this.deveui = ((res as any).deveui as string).toUpperCase();
    });
  }

  genDEVADDR() {
    this._api.getDEVADDR().subscribe(res => {
      this.devaddr = ((res as any).devaddr as string).toUpperCase();
    });
  }

  ngOnInit() {
    this.getDevices();
    this.genDEVEUI();
    this.genDEVADDR();
  }

}
