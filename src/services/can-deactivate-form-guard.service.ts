import {Injectable} from '@angular/core';
import {CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {FormBaseComponent} from '@elements/pbx-form-base-component/pbx-form-base-component.component';
import {Observer} from 'rxjs/Observer';

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
        // console.log('can-deactivate', state.url);

        return component.canDeactivate 
            ? component.canDeactivate()
            : true;
    }
}
