import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { ApiService } from '../../@services/api.service/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  constructor(private _api: ApiService,
              private router: Router,
              public snackBar: MatSnackBar) { }

  private username = '';
  private secret = '';
  private loginText = this._api.checkIsAuthenticated() ? '(Logged in)' : '';

  private hide = true;

  clickLogin() {
    this._api.login(this.username, this.secret)
    .subscribe(res => {
      this._api.saveAccessToken(res.access_token);
      this._api.setIsAuthenticated(res.authenticated);
      if (res.authenticated) {
        this.router.navigate([`dashboard`]);
        this.snackBar.open('Login succeded', 'Close', {
          duration: 3000
        });
      } else {
        this.loginText = 'Wrong password';
        this.snackBar.open('Login attempt failed', 'Close', {
          duration: 3000
        });
      }
    });
  }
}
