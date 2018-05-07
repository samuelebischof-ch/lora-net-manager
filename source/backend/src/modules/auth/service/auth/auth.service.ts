import * as jwt from 'jsonwebtoken';
import { Component, Inject } from '@nestjs/common';
import * as configJSON from '../../../../../config.json';
import { Config } from '../../../interfaces/config.interface';
import { RealmService } from '../../../services/realm/realm.service';

const config: Config = configJSON as any;

@Component()
export class AuthService {

  constructor(private readonly _realm: RealmService) {

  }
  async createToken(username: string, secret: string) {
    const correctUser = config.jwt.user;
    const correctSecret = config.jwt.secret;
    if (correctUser === username && correctSecret === secret) {
      // expiresIn 1 hour
      const expiresIn = config.jwt.expiration;
      const user = { email: username };
      const token = jwt.sign(user, secret, { expiresIn });
      this._realm.saveJWTToken(token);
      return {
        expires_in: expiresIn,
        access_token: token,
        authenticated: true,
      };
    } else {
      return {
        authenticated: false,
      }
    }
  }

  async validateUser(signedUser): Promise<boolean> {
    // put some validation logic here
    // for example query user by id / email / username
    return true;
  }
}