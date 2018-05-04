import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../@services/api.service/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  constructor(private _api: ApiService,
              private router: Router) { }

    ngOnInit() {
      if (!this._api.checkIsAuthenticated()) {
        this.router.navigate([`login`]);
      }
    }

  }
