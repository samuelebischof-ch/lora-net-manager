import * as jwt from 'jsonwebtoken';
import { Component, Inject } from '@nestjs/common';
import * as config from '../../../../../../config.json';

@Component()
export class AuthService {
  async createToken(username: string, secret: string) {
    const correctSecret = (config as any).secret;
    const expiresIn = 60 * 60;
    const user = { email: username };
    const token = jwt.sign(user, secret, { expiresIn });
    return {
      expires_in: expiresIn,
      access_token: token,
      authenticated: (correctSecret == secret),
    };
  }

  async validateUser(signedUser): Promise<boolean> {
    // put some validation logic here
    // for example query user by id / email / username
    return true;
  }
}