import {Component, ViewChild} from '@angular/core';
import {Observable} from 'rxjs/Observable';

import {FadeAnimation} from '@shared/fade-animation';
import {BaseSettingsComponent} from '@components/settings/settings-items/base-settings/base-settings.component';
import {CanFormComponentDeactivate} from '@services/can-deactivate-form-guard.service';


@Component({
    selector: 'authorization-component',
    templateUrl: './template.html',
    styleUrls: ['../local.sass'],
    animations: [FadeAnimation('300ms')]
})
export class AuthenticationComponent implements CanFormComponentDeactivate {
    @ViewChild('baseSettings') baseSettings: BaseSettingsComponent;
    
    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        return this.baseSettings.canDeactivate();
    }
}
