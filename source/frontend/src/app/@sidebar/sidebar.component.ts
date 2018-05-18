import { Component, OnInit } from '@angular/core';
import { toggleFullScreen } from '../@helpers/fullscreen';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  public screenIcon = 'fullscreen';

  constructor() { }

  ngOnInit() {
  }

  toggleFullScreen() {
    toggleFullScreen();
    this.screenIcon = (this.screenIcon === 'fullscreen') ? 'fullscreen_exit' : 'fullscreen';
  }

}
