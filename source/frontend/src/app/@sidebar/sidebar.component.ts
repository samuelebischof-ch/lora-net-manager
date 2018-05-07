import { Component, OnInit } from '@angular/core';
import { toggleFullScreen } from '../@helpers/fullscreen';
import { AuthenticationService } from '../@services/authentication.service/authentication.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  public screenIcon = 'fullscreen';

  constructor(private _authentication: AuthenticationService) { }

  ngOnInit() {
  }

  toggleFullScreen() {
    toggleFullScreen();
    this.screenIcon = (this.screenIcon === 'fullscreen') ? 'fullscreen_exit' : 'fullscreen';
  }

  logout() {
    this._authentication.logout();
  }

}
