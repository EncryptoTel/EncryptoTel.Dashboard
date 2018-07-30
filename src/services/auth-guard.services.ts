import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';

import {UserServices} from './user.services';

/*
  Authentication guardian service.
  Navigate to authorization if user not signed in
 */

@Injectable()
export class AuthGuardServices implements CanActivate {
    constructor(private router: Router,
                private _services: UserServices) {
    }

    canActivate(): boolean {
        if (!this._services.fetchUser()) {
            // localStorage.clear();
            this.router.navigateByUrl('/sign-in');
            return false;
        }
        return !!this._services.fetchUser();
    }
}
