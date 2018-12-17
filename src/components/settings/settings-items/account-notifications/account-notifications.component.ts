import {Component, ViewChild} from '@angular/core';

import {FadeAnimation} from '@shared/fade-animation';
import {CanFormComponentDeactivate} from '@services/can-deactivate-form-guard.service';
import {BaseSettingsComponent} from '@components/settings/settings-items/base-settings/base-settings.component';
import {Observable} from 'rxjs/Observable';


@Component({
    selector: 'account-notifications-component',
    templateUrl: './template.html',
    styleUrls: ['../local.sass'],
    animations: [FadeAnimation('300ms')]
})
export class AccountNotificationsComponent implements CanFormComponentDeactivate {
    @ViewChild('baseSettings') baseSettings: BaseSettingsComponent;
    
    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        return this.baseSettings.canDeactivate();
    }
}
