import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

import {RequestServices} from './request.services';
import {LoggerServices} from './logger.services';
import {StorageServices} from './storage.services';
import {MessageServices} from './message.services';

import {SignInFormModel} from '../models/form-sign-in.model';
import {SignUpFormModel} from '../models/form-sign-up.model';
import {UserModel} from '../models/user.model';

import * as _vars from '../shared/vars';

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
  saveUserData = (user: UserModel): void => {
    this._storage.writeItem('pbx_user', user);
  }
  /*
    Changing user param
   */
  changeUserParam = (param: string, value: any): void => {
    const user = this._storage.readItem('pbx_user');
    user[param] = value;
    this.logger.log(user);
    this._storage.writeItem('pbx_user', user);
  }
  /*
    Fetch if user already logged in
   */
  fetchUser = (): UserModel => {
    return this._storage.readItem('pbx_user');
  }
  /*
    Sign-in form submit. Accepted params:
    Data - sign in form values
   */
  signIn(data: SignInFormModel) {
    return this._req.post('login', {
      ..._vars.auth_params,
      ...data
    }).then(result => {
      if (result && !result.message) {
        this.logger.log(result);
        this.saveUserData({secrets: result});
        this.message.writeSuccess('Successfully logged in!');
        this.router.navigateByUrl('/cabinet');
      } else if (result && result.message) {
        this.message.writeWarning(result.message);
      }
    });
  }
  /*
    Sign-up form submit. Accepted params:
    Data - sign up form values
   */
  signUp(data: SignUpFormModel) {
    return this._req.post('register', {
      ...data
    }).then(result => {
      if (result && !result.message) {
        this.logger.log(result);
        this.message.writeSuccess('Account successfully created! Verify your e-mail address before logging in');
        this.router.navigateByUrl('/');
      } else if (result && result.message) {
        this.message.writeWarning(result.message);
      }
    });
  }
}
