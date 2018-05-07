import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../@services/api.service/api.service';

@Component({
  selector: 'app-meteo',
  templateUrl: './meteo.component.html',
  styleUrls: ['./meteo.component.scss']
})
export class MeteoComponent implements OnInit {

  public meteo;

  constructor(private _api: ApiService) { }

  ngOnInit() {
    this._api.getMeteo().subscribe(res => {
      this.meteo = res;
      console.log(res);
    });
  }

}
