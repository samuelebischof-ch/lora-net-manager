import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../@services/authentication.service/authentication.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  constructor(private _authentication: AuthenticationService,
              private router: Router) { }

    ngOnInit() {
      if (!this._authentication.isAuthenticated()) {
        this.router.navigate([`login`]);
      }
    }

  }
