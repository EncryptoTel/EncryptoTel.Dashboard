import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

import {RequestServices} from './request.services';
import {LoggerServices} from './logger.services';
import {StorageServices} from './storage.services';

import {SignInFormModel} from '../models/form-sign-in.model';
import {UserModel} from '../models/user.model';

import * as _vars from './vars';

@Injectable()
export class UserServices {
  constructor(private router: Router,
              private _req: RequestServices,
              private _storage: StorageServices,
              private logger: LoggerServices) {}
  saveUserData = (user) => {
    this._storage.writeItem('user', user);
  }
  changeUserParam = (param: string, value: any) => {
    const user = this._storage.readItem('user');
    user[param] = value;
    this.logger.log(user);
    this._storage.writeItem('user', user);
  }
  fetchUser = (): UserModel => {
    return this._storage.readItem('user');
  }
  /*
    Sign-in form submit. Accepted params:
    Data - form values
   */
  signIn(data: SignInFormModel) {
    this._req.post('user', {
      ..._vars.auth_params,
      ...data
    })
      .then(result => {
        if (result) {
          this.saveUserData(result);
        }
        this.router.navigateByUrl('/');
      });
  }
}
