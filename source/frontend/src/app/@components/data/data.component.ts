import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ApiService } from '../../@services/api.service/api.service';
import { WsService } from '../../@services/ws.service/ws.service';
import { Subscription } from 'rxjs';
import { forEach } from '@angular/router/src/utils/collection';
import { FormControl } from '@angular/forms';
import { WebWorkerService } from 'angular2-web-worker';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss'],
})
export class DataComponent implements OnInit {

  public devicesByRoom;
  private apiDataArray: Array<ApiData> = [];
  private dataArray: Array<DataArrayEl> = [];
  private lineChartLabels: Array<string> = [];

  public roomList = [];

  public deveui = '';

  public barMode = 'determinate';

  public direction = 'horizontal';

  public liveMode = false;

  public startDate = new FormControl(new Date(new Date(Date.now()).setUTCHours(0, 0, 0, 0)));
  public endDate = new FormControl(new Date(new Date(Date.now()).setUTCHours(24, 0, 0, 0)));

  constructor(
    private _api: ApiService,
    private _webWorkerService: WebWorkerService,
  ) { }

  async ngOnInit() {
    await this.getDevicesByRoom();
  }

  toggleView(modus) {
    if (modus.value === 'normal') {
      this.liveMode = false;
      this.barMode = 'determinate';
      this.reloadData(null, this.deveui);
    } else {
      this.liveMode = true;
      this.barMode = 'indeterminate';
      for (const room of this.devicesByRoom) {
        for (const device of room.devices) {
          if (device.deveui !== this.deveui) {
            device.checked = false;
          }
        }
      }
    }
  }

  /**
  * @name reloadData
  * @param event
  * @param deveui
  * @description checks visualisation mode and requests new sensor data to the api
  */
  async reloadData(event, deveui: string) {
    // uncheck device if necessary
    let noneChecked = true;
    let deveuiFull = true;
    for (const room of this.devicesByRoom) {
      for (const device of room.devices) {
        if (device.checked) {
          noneChecked = false;
        }
        if (deveui === this.deveui) {
          if (event !== null && event !== undefined && !event.checked) {
            this.deveui = '';
            deveuiFull = false;
          }
        }
      }
    }
    if (deveuiFull) {
      this.deveui = deveui;
    }
    if (noneChecked) {
      this.deveui = '';
    }

    // if mode is live
    if (this.liveMode) {
      // uncheck all but device with deveui === deveui
      for (const room of this.devicesByRoom) {
        for (const device of room.devices) {
          if (device.deveui === deveui) {
            device.checked = true;
          } else {
            device.checked = false;
          }
        }
      }
      // if mode is normal
    } else {
      this.barMode = 'query';
      this.apiDataArray = [];
      this.dataArray = [];
      this.lineChartLabels = [];
      for (const room of this.devicesByRoom) {
        for (const device of room.devices) {
          if (device.checked) {
            const response = await this._api.getData(
              device.deveui, Number(new Date(this.startDate.value)),
              Number(new Date(this.endDate.value))
            );
            if (response !== null && response !== undefined) {
              this.apiDataArray.push(response);
            }
          }
        }
      }
      this.initializeDataArray();
      await this.initializeData();
      this.barMode = 'determinate';
    }
  }

  /**
  * @name roomClicked
  * @param name
  * @description loads the data when a room is clicked on the map
  */
  roomClicked(name) {
    this.devicesByRoom.forEach(room => {
      if (room.name === name) {
        room.expanded = true;
        room.devices.forEach(device => {
          device.checked = true;
          this.deveui = device.deveui;
        });
      } else {
        room.expanded = false;
        room.devices.forEach(device => {
          device.checked = false;
        });
      }
    });
    this.reloadData({checked: true}, this.deveui);
  }

  /**
  * @name getDevicesByRoom
  * @description requests the room list with associated devices
  */
  getDevicesByRoom() {
    this._api.getDevicesByRoom().subscribe(res => {
      if (res !== undefined) {
        this.devicesByRoom = res;
        this.devicesByRoom.forEach(room => {
          this.roomList.push(room.name);
        });
      }
    });
  }

  /**
  * @name initializeDataArray
  * @description initializes dataArray
  */
  initializeDataArray() {
    if (this.apiDataArray.length > 0) {
      for (let i = 0; i < this.apiDataArray[0].data.length; i++) {
        this.dataArray.push({
          label: '',
          lineChartData: [],
          unit: '',
          min: Number.POSITIVE_INFINITY,
          max: Number.NEGATIVE_INFINITY,
          avg: [],
        });
      }
    }
  }

  /**
  * @name normalizeData
  * @param dataApiArray
  * @returns normalizes dataApiArray, normalized timeline
  * @description normalizes data from multiple devices to display with one single time axis
  */
  normalizeData(dataApiArray: Array<ApiData>) { // TODO: check for null data

    console.log('Running on new thread');

    const timeline: Array<string> = [];
    const temp: Array<Temp> = [];

    // (1) iterate over all different datasets and extract data
    let counter = 0;
    for (const apiDataEl of dataApiArray) {
      // iterate in every dataset and push data to temp
      let dPointer = 0;
      let tPointer = 0;
      while (dPointer < apiDataEl.date.length && tPointer <= temp.length) {
        // tslint:disable-next-line:max-line-length
        if (tPointer < temp.length && new Date(apiDataEl.date[dPointer]) > new Date(temp[tPointer].date)) { // se piu grande muovi a destra su temp
          // console.log('bigger')
          tPointer++;
          // tslint:disable-next-line:max-line-length
        } else if (tPointer < temp.length && new Date(apiDataEl.date[dPointer]).setMilliseconds(0) === new Date(temp[tPointer].date).setMilliseconds(0)) { // se uguale inserisci
          const t: Temp = { date: '', data: [] };
          t.date = apiDataEl.date[dPointer];
          // create data portion for most inside array
          const dataT = [];
          apiDataEl.data.forEach(apiDataElDataEl => {
            dataT.push(apiDataElDataEl.data[dPointer]);
          });
          temp[tPointer].data[counter] = dataT;
          tPointer++;
          dPointer++;
          // console.log('ssssss')
        } else { // se piu piccolo oppure alla fine inizio
          // console.log('ccccc')
          const t: Temp = { date: '', data: [] };
          t.date = apiDataEl.date[dPointer];
          // create data portion for most inside array
          const dataT = [];
          apiDataEl.data.forEach(el => {
            dataT.push(el.data[dPointer]);
          });
          const nulls = [];
          apiDataEl.data.forEach(el => {
            nulls.push(null);
          });
          // create data outside and insert previously created dataT
          for (let i = 0; i < dataApiArray.length; i++) {
            t.data.push(nulls);
          }
          t.data[counter] = dataT;
          // insert t at position tPointer
          temp.splice(tPointer, 0, t);
          tPointer++;
          dPointer++;
        }

      }

      counter++;
    }

    // (2) write data back to dataApiArray
    for (let i = 0; i < dataApiArray.length; i++) { // loop on different datasets
      for (let j = 0; j < dataApiArray[i].data.length; j++) { // loop on different sensors
        dataApiArray[i].data[j].data = new Array<number>();
        temp.forEach(tempEl => {
          dataApiArray[i].data[j].data.push(tempEl.data[i][j]);
        });
      }
    }

    // (3) extract data to timeline
    temp.forEach(element => {
      timeline.push(element.date);
    });

    return [dataApiArray, timeline];
  }

  /**
  * @name initializeData
  * @description initializes the data after devices are selected
  */
  async initializeData() {
    [this.apiDataArray, this.lineChartLabels] = await this.runNormalizeDataOnNewThread(this.apiDataArray);

    // puts data to dataArray and makes statistics
    for (let c = 0; c < this.apiDataArray.length; c++) {
      // this.organizeLabels(c);
      if (this.apiDataArray.length > 0) {
        for (let i = 0; i < this.apiDataArray[0].data.length; i++) {
          this.dataArray[i].label = this.apiDataArray[c].data[i].label;
          this.dataArray[i].unit = this.apiDataArray[c].data[i].unit; // TODO check loop to much overhead
          this.dataArray[i].lineChartData.push({
            data: this.apiDataArray[c].data[i].data,
            label: this.apiDataArray[c].data[i].desc,
            spanGaps: true,
          });
          this.makeStatistics(this.apiDataArray[c].data[i].data, this.dataArray[i]);
        }
      }
    }
  }

  // avg is the average of all the averages of graphs displayed
  /**
  * @name makeStatistics
  * @param input Array<number>
  * @param output DataArrayEl
  * @description makes some minimal statistics on the readings
  */
  makeStatistics(input: Array<number>, output: DataArrayEl) {
    let sum = 0;
    let count = 0;
    input.forEach(el => {
      if (el !== null && el < output.min) { output.min = Math.round(el * 10) / 10; }
      if (el !== null && el > output.max) { output.max = Math.round(el * 10) / 10; }
      if (el !== null) {
        sum += el;
        count++;
      }
    });
    if (count === 0) {
      output.avg.push(null);
    } else {
      output.avg.push(sum / count);
    }
  }

  /**
  * @name hasValue
  * @param avg Array<any>
  * @returns true if the array has elements different from null
  */
  hasValues(avg: Array<any>): boolean {
    let hasValue = false;
    avg.forEach(element => {
      if (!isNaN(element)) { hasValue = true; }
    });
    return hasValue;
  }

  /**
  * @name runNormalizeDataOnNewThread
  * @param input
  * @description runs normalizeData on input in another thread
  */
  runNormalizeDataOnNewThread(input) {
    return this._webWorkerService.run(this.normalizeData, input);
  }

}

interface Temp {
  date: string;
  data: Array<Array<number>>;
}

interface ApiData {
  date: Array<string>;
  data: [ApiDataEl];
}

interface ApiDataEl {
  label: string;
  unit: string;
  data: Array<number>;
  deveui: string;
  desc: string;
}

interface DataArrayEl {
  label: string;
  lineChartData: Array<{
    data: Array<number>,
    label: string,
    spanGaps: boolean,
  }>;
  unit: string;
  min: number;
  max: number;
  avg: Array<number>;
}
