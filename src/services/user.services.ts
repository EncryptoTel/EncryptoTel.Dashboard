import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

import {RequestServices} from './request.services';
import {LoggerServices} from './logger.services';
import {LocalStorageServices} from './local-storage.services';

import {UserModel} from '../models/user.model';
import {NavigationItemModel} from '../models/navigation-item.model';

/*
  User services. Authentication, user params changing etc.
*/

@Injectable()
export class UserServices {
  constructor(private _req: RequestServices,
              private _storage: LocalStorageServices,
              private logger: LoggerServices) {}
  user: UserModel;
  subscription: Subject<UserModel> = new Subject<UserModel>();
  /*
    Fetch initial user profile params
   */
  fetchProfileParams(): Promise<UserModel> {
    return this._req.get('v1/account/info', true).then(res => {
      // for (const param in res['user']) {
      //   if (res['user'].hasOwnProperty(param)) {
      //     this.changeUserParam(param, res['user'][param]);
      //   }
      // }
      this.changeUserParam('profile', res['user']);
      this.changeUserParam('balance', res['balance']);
      return Promise.resolve(this.fetchUser());
    }).catch();
  }
  /*
    Saving user data
   */
  saveUserData = (user: UserModel): void => {
    this._storage.writeItem('pbx_user', user);
    this.touchUser();
  }
  /*
    Changing user param
   */
  changeUserParam = (param: string, value: any): void => {
    const user = this._storage.readItem('pbx_user');
    user[param] = value;
    // this.logger.log(`User after '${param}' changing to '${value}'`, user);
    this._storage.writeItem('pbx_user', user);
    this.touchUser();
  }
  /*
    Fetch initial navigation params, based on current user tariff plan
   */
  fetchNavigationParams(): Promise<NavigationItemModel[][]> {
    return this._req.get('v1/nav', true).then(res => {
      return Promise.resolve(res['items']);
    }).catch();
  }
  /*
    Fetch if user already logged in
   */
  fetchUser = (): UserModel | null => {
    return this._storage.readItem('pbx_user');
  }
  /*
    Refresh user params
   */
  touchUser(): void {
    this.user = this._storage.readItem('pbx_user');
    this.subscription.next(this.user);
  }
  /*
    User params subscription
   */
  userSubscription(): Observable<UserModel> {
    return this.subscription.asObservable();
  }
}
