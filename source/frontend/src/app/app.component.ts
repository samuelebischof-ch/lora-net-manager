import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { WsService } from './@services/ws.service/ws.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private _ws: WsService,
              public snackBar: MatSnackBar) {}

  private iconName = 'keyboard_arrow_left';
  private opened = true;

  ngOnInit() {
    this._ws.getEvents().subscribe(res => {
      console.log(res);
      this.snackBar.open(res.deveui + ' ' + res.event, 'Close', {
        duration: 3000
      });
    });
  }

}
