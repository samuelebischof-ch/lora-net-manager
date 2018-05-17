import { Component, OnInit } from '@angular/core';
import { NotificationsService } from './@services/notifications.service/notifications.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private _notifications: NotificationsService,
  ) {}

  private iconName = 'keyboard_arrow_left';
  private opened = true;

  ngOnInit() {
    this._notifications.subscribeToNotifications();
    this._notifications.connectEvents();
  }

}
