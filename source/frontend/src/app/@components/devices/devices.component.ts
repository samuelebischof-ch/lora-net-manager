import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../@services/api.service/api.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.scss']
})
export class DevicesComponent implements OnInit {

    private devices: any;
    private deveui = '';
    private devaddr = '';
    private room = '';
    private desc = '';
    private model = '';
    private has_temperature = false;
    private has_pressure = false;
    private has_humidity = false;
    private has_moisture = false;
    private has_movement = false;
    private has_door_sensor = false;
    private has_light_sensor = false;

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
            has_temperature: this.has_temperature,
            has_pressure: this.has_pressure,
            has_humidity: this.has_humidity,
            has_moisture: this.has_moisture,
            has_movement: this.has_movement,
            has_door_sensor: this.has_door_sensor,
            has_light_sensor: this.has_light_sensor
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
