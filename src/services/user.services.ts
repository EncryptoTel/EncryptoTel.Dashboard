import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

import {RequestServices} from './request.services';
import {LoggerServices} from './logger.services';
import {StorageServices} from './storage.services';

import {SignInFormModel} from '../models/form-sign-in.model';
import {UserModel} from '../models/user.model';
import {MessageServices} from './message.services';

import * as _vars from './vars';

/*
  User services. Authentication, user params changing etc.
*/

@Injectable()
export class UserServices {
  constructor(private router: Router,
              private message: MessageServices,
              private _req: RequestServices,
              private _storage: StorageServices,
              private logger: LoggerServices) {}
  /*
    Saving user data
   */
  saveUserData = (user): void => {
    this._storage.writeItem('user', user);
  };
  /*
    Changing user param
   */
  changeUserParam = (param: string, value: any): void => {
    const user = this._storage.readItem('user');
    user[param] = value;
    this.logger.log(user);
    this._storage.writeItem('user', user);
  };
  /*
    Fetch if user already logged in
   */
  fetchUser = (): UserModel => {
    return this._storage.readItem('user');
  };
  /*
    Sign-in form submit. Accepted params:
    Data - sign in form values
   */
  signIn(data: SignInFormModel) {
    return this._req.post('oauth/token', {
      ..._vars.auth_params,
      ...data
    }).then(result => {
      if (result) {
        this.saveUserData(result);
        this.message.writeSuccess('Successfully logged in!');
      }
      this.router.navigateByUrl('/');
    });
  }
  /*
    Sign-up form submit. Accepted params:
    Data - sign up form values
   */
  signUp(data: SignInFormModel) {
    return this._req.post('user/register', {
      ...data
    }).then(result => {
      if (result) {
        this.saveUserData(result);
        this.message.writeSuccess('Successfully logged in!');
      }
      this.router.navigateByUrl('/');
    });
  }
}
