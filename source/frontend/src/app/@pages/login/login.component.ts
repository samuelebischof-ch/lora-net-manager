import { Component } from '@angular/core';
import { AuthenticationService } from '../../@services/authentication.service/authentication.service';
import { ApiService } from '../../@services/api.service/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  constructor(private _api: ApiService,
              private _authentication: AuthenticationService) { }

  private username = '';
  private secret = '';
  private loginText = this._authentication.isAuthenticated() ? '(Logged in)' : '';

  private hide = true;

  async clickLogin() {
    await this._api.login(this.username, this.secret);
    if (!(await this._authentication.isAuthenticated())) {
      this.loginText = 'User not authorized';
    }
  }
}
