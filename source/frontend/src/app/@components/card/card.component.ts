import { Component, OnInit, OnDestroy, OnChanges, Input, SimpleChanges } from '@angular/core';
import { ApiService } from '../../@services/api.service/api.service';
import { WsService } from '../../@services/ws.service/ws.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit, OnChanges, OnDestroy {

  private sub: Subscription;
  public data;

  constructor(
    private _api: ApiService,
    private _ws: WsService,
  ) { }

  @Input() deveui: string;
  @Input() startDate: number;

  onChange(evt) {
  }

  ngOnInit() {
    this.connectWs(Number(new Date(this.startDate)), undefined, this.deveui);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.sub !== undefined) {
      this.sub.unsubscribe();
      this._ws.disconnect();
    }
    if (changes.deveui !== undefined) {
      this.deveui = changes.deveui.currentValue;
      this.connectWs(Number(new Date(this.startDate)), undefined, this.deveui);
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this._ws.disconnect();
  }

  // tracks changes in data to prevent reload on other object changes
  trackByLength(index: number, data): number { return data.data.length; }

  /**
  * @name connectWs
  * @param min
  * @param max
  * @description connects the websocket client to receive data
  */
  connectWs(min, max, deveui) {
    this.sub = this._ws.getData(deveui, min, max)
    .subscribe(res => {
      if (res.date !== undefined && res.data !== undefined) {
        this.data = res;
        const _data = JSON.parse(JSON.stringify(this.data));
        for (let i = 0; i < _data.data.length; i++) {
          _data.data[i].data = [];
          _data.data[i].data.push({data: this.data.data[i].data, label: this.data.data[i].desc});
        }
        this.data = _data;
      // new data
      } else if (res.newData !== undefined) {
        const _data = JSON.parse(JSON.stringify(this.data));
        for (let i = 0; i < res.newData.length; i++) {
          _data.data[i].data[0].data.push(res.newData[i].data);
        }
        _data.date.push(res.newDate);
        this.data = _data;
      }
    });
  }
}
