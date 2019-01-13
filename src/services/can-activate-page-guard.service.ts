import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { UserServices } from '@services/user.services';

@Injectable()
export class CanActivatePageGuard implements CanActivate {

    constructor(
        private router: Router,
        private service: UserServices
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        if (this.service.navigation) {
            return this.checkAccess(route.routeConfig.path);
        }

        return new Promise<boolean>((resolve) => {
            this.service.fetchNavigationParams()
                .then(() => {
                    const access: boolean = this.checkAccess(route.routeConfig.path);
                    resolve(access);
                })
                .catch(() => resolve(false));
        });
    }

    private checkAccess(module: string): boolean {
        let access: boolean = false;

        this.service.navigation.forEach(block => {
            block.forEach(m => {
                if (m.url === module) access = true;
            });
        });

        if (!access) {
            this.router.navigate(['/cabinet/dashboard']);
            return false;
        }

        return true;
    }
}
