import { Injectable } from '@angular/core';
import { Auth } from '../../@interfaces/auth.interface';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import * as moment from 'moment';

@Injectable()
export class AuthenticationService {

  constructor(private router: Router,
    public snackBar: MatSnackBar) { }

    authenticate(authResponse: Auth) {
      if (authResponse.authenticated) {
        this.setSession(authResponse);
        this.router.navigate([`dashboard`]);
        this.snackBar.open('Login succeded', 'Close', {
          duration: 3000,
        });
      } else {
        this.snackBar.open('Login attempt failed', 'Close', {
          duration: 3000,
        });
      }
    }

    setSession(authResult) {
      const expiresAt = moment().add(authResult.expires_in, 'second');

      localStorage.setItem('access_token', authResult.access_token);
      localStorage.setItem('expires_at', JSON.stringify(expiresAt.valueOf()) );
    }

    logout() {
      localStorage.removeItem('access_token');
      localStorage.removeItem('expires_at');
    }

    getExpiration() {
      const expiration = localStorage.getItem('expires_at');
      const expiresAt = JSON.parse(expiration);
      return moment(expiresAt);
    }

    isAuthenticated(): boolean {
      return moment().isBefore(this.getExpiration());
    }

    getToken() {
      const token = localStorage.getItem('access_token');
      console.log(token);
      return token;
    }

  }
