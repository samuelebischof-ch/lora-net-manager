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
    private _authentication: AuthenticationService
  ) { }

  public username = '';
  public secret = '';
  public loginText = this._authentication.isAuthenticated() ? '(Logged in)' : '';

  public hide = true;

  /**
   * @name clickLogin
   * @description handles authentication with the backend
   */
  async clickLogin() {
    await this._api.login(this.username, this.secret);
    if (!(await this._authentication.isAuthenticated())) {
      this.loginText = 'User not authorized';
    }
  }
}
