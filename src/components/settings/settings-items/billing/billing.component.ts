import {Component, ViewChild} from '@angular/core';
import {Observable} from 'rxjs/Observable';

import {FadeAnimation} from '@shared/fade-animation';
import {CanFormComponentDeactivate} from '@services/can-deactivate-form-guard.service';
import {BaseSettingsComponent} from '@components/settings/settings-items/base-settings/base-settings.component';


@Component({
    selector: 'billing-component',
    templateUrl: './template.html',
    styleUrls: ['../local.sass'],
    animations: [FadeAnimation('300ms')]
})
export class BillingComponent implements CanFormComponentDeactivate {
    @ViewChild('baseSettings') baseSettings: BaseSettingsComponent;
    
    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        return this.baseSettings.canDeactivate();
    }
}
