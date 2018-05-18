import { Component, OnInit } from '@angular/core';
import { NotificationsService } from './@services/notifications.service/notifications.service';
import { AuthenticationService } from './@services/authentication.service/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private _notifications: NotificationsService,
    private _authentication: AuthenticationService,
  ) {}

  public iconName = 'keyboard_arrow_left';
  public opened = true;
  public isAuthenticated: boolean;

  ngOnInit() {
    this._notifications.subscribeToNotifications();
    this._notifications.connectEvents();
    this.isAuthenticated = this._authentication.isAuthenticated();
    this._authentication.getObservable().subscribe((next: boolean) => {
      this.isAuthenticated = next;
    });
  }

  logout() {
    this._authentication.logout();
  }

}
