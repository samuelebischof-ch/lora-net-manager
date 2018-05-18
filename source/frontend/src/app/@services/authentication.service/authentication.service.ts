import { Injectable } from '@angular/core';
import { Auth } from '../../../../../shared/interfaces/auth.interface';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { Observable, Observer } from 'rxjs';
import * as moment from 'moment';

@Injectable()
export class AuthenticationService {

  private authObserver: Observer<boolean>;

  constructor(private router: Router,
    public snackBar: MatSnackBar) { }

    /**
     * @name authenticate
     * @param authResponse Auth
     * @description authenticates the application
     */
    authenticate(authResponse: Auth) {
      if (authResponse.authenticated) {
        this.setSession(authResponse);
        this.router.navigate([`dashboard`]);
        this.authObserver.next(true);
        this.snackBar.open('Login succeded', 'Close', {
          duration: 3000,
        });
      } else {
        this.snackBar.open('Login attempt failed', 'Close', {
          duration: 3000,
        });
      }
    }

    /**
     * @name setSession
     * @param authResult
     * @description creates a session
     */
    setSession(authResult) {
      const expiresAt = moment().add(authResult.expires_in, 'second');

      localStorage.setItem('access_token', authResult.access_token);
      localStorage.setItem('expires_at', JSON.stringify(expiresAt.valueOf()) );
    }

    /**
     * @name logout
     * @description removes the session
     */
    logout() {
      localStorage.removeItem('access_token');
      localStorage.removeItem('expires_at');
      this.authObserver.next(false);
    }

    /**
     * @name getExpiration
     * @returns the expiration of the aunthentication
     */
    getExpiration() {
      const expiration = localStorage.getItem('expires_at');
      const expiresAt = JSON.parse(expiration);
      return moment(expiresAt);
    }

    /**
     * @name isAuthenticated
     * @returns ture if it is authenticated
     */
    isAuthenticated(): boolean {
      return moment().isBefore(this.getExpiration());
    }

    /**
     * @name getToken
     * @description returns the token from local storage
     */
    getToken() {
      const token = localStorage.getItem('access_token');
      return token;
    }

    getObservable() {
      return new Observable(observer => {
        this.authObserver = observer;
      });
    }

  }
