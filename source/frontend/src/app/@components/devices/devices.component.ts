import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../@services/api.service/api.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.scss']
})
export class DevicesComponent implements OnInit {

    public devices: any;
    public deveui = '';
    public devaddr = '';
    public room = '';
    public desc = '';
    public model = '';
    public has_temperature = false;
    public has_pressure = false;
    public has_humidity = false;
    public has_moisture = false;
    public has_movement = false;
    public has_door_sensor = false;
    public has_light_sensor = false;

    public panelOpenState: boolean;

    constructor(private _api: ApiService,
                public snackBar: MatSnackBar) { }

      addDevice() {
        if (this.isDEVEUI(this.deveui) && this.isDEVADDR(this.devaddr)) {
          const options = {
            room: {roomName: this.room},
            desc: this.desc,
            model: this.model,
            deveui: this.deveui,
            devaddr: this.devaddr,
            data_sheet: {
              sensor_temperature: { has_sensor: this.has_temperature },
              sensor_pressure: { has_sensor: this.has_pressure },
              sensor_humidity: { has_sensor: this.has_humidity },
              sensor_moisture: { has_sensor: this.has_moisture },
              sensor_movement: { has_sensor: this.has_movement },
              sensor_door_sensor: { has_sensor: this.has_door_sensor },
              sensor_light_sensor: { has_sensor: this.has_light_sensor },
            },
          };
          this._api.addDevice(options).subscribe(res => this.getDevices());
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
