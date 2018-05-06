import { Component, OnInit, OnDestroy, OnChanges, Input } from '@angular/core';
import { ApiService } from '../../@services/api.service/api.service';
import { WsService } from '../../@services/ws.service/ws.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit, OnChanges, OnDestroy {

  private sub: Subscription;
  private data;

  constructor(private _api: ApiService,
    private _ws: WsService) { }

    @Input() deveui: string;
    @Input() startDate: number;

    onChange(evt) {
      console.log(evt);
    }

    ngOnInit() {
      this.connectWs(Number(new Date(this.startDate)), undefined);
    }


    ngOnChanges() {
      if (this.sub !== undefined) {
        this.sub.unsubscribe();
        this._ws.disconnect();
      }
    }

    ngOnDestroy() {
      this.sub.unsubscribe();
      this._ws.disconnect();
    }

    // so that change in data does not reload eveything
    trackByLength(index: number, data): number { return data.data.length; }

    connectWs(min, max) {
      this.sub = this._ws.getData(this.deveui, min, max)
      .subscribe(res => {
        console.log(res)
        if (res.date !== undefined && res.data !== undefined) {
          this.data = res;
          const _data = JSON.parse(JSON.stringify(this.data));
          for (let i = 0; i < _data.data.length; i++) {
            _data.data[i].data = [];
            _data.data[i].data.push({data: this.data.data[i].data, label: this.data.data[i].desc});
          }
          this.data = _data;
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
