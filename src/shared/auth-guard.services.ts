import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {UserServices} from './user.services';

@Injectable()
export class AuthGuardServices implements CanActivate {
  constructor(private router: Router,
              private _services: UserServices) {}
  canActivate() {
    if (!this._services.fetchUser()) {
      localStorage.clear();
      this.router.navigateByUrl('/sign-in');
      return false;
    }
    return !!this._services.fetchUser();
  }
}
