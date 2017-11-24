import {Injectable} from '@angular/core';

import {LoggerServices} from './logger.services';
import {StorageServices} from './storage.services';

import {UserModel} from '../models/user.model';

/*
  User services. Authentication, user params changing etc.
*/

@Injectable()
export class UserServices {
  constructor(private _storage: StorageServices,
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
    this.logger.log(`User after ${param} changing to ${value}`, user);
    this._storage.writeItem('pbx_user', user);
  }
  /*
    Fetch if user already logged in
   */
  fetchUser = (): UserModel => {
    return this._storage.readItem('pbx_user');
  }
}
