import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';


export interface CanFormComponentDeactivate {
    canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable()
export class CanDeactivateFormGuard implements CanDeactivate<CanFormComponentDeactivate> {

    canDeactivate(
        component: CanFormComponentDeactivate,
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ) {
        // console.log('can-deactivate', state.url, component);

        return component.canDeactivate
            ? component.canDeactivate()
            : true;
    }
}
