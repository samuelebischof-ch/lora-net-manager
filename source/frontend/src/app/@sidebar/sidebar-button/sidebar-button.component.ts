import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-sidebar-button',
  templateUrl: './sidebar-button.component.html',
  styleUrls: ['./sidebar-button.component.scss']
})
export class SidebarButtonComponent implements OnInit {

  constructor() { }

  @Input() iconName = 'home';
  @Input() text = '';

  ngOnInit() {
  }

}
