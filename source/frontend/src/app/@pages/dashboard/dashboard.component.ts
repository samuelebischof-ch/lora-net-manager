import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../@services/authentication.service/authentication.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(private _authentication: AuthenticationService,
              private router: Router) { }

  ngOnInit() {
    if (!this._authentication.isAuthenticated()) {
      this.router.navigate([`login`]);
    }
  }

}
