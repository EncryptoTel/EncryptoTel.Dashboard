import {Component} from '@angular/core';
import {AuthorizationServices} from '../../services/authorization.services';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import * as _vars from '../../shared/vars';
import {passwordConfirmation} from '../../shared/password-confirmation';


@Component({
  selector: 'sign-up',
  template: '<router-outlet></router-outlet>'
})
export class SignUpComponent {
    constructor(private _services: AuthorizationServices) {
        this._services.signUpData = new FormGroup({
                'firstname': new FormControl('', [
                    Validators.required,
                    Validators.pattern(_vars.nameRegExp)
                ]),
                'email': new FormControl('', [
                    Validators.required,
                    Validators.pattern(_vars.emailRegExp)
                ]),
                'password': new FormControl('', [
                    Validators.required,
                    Validators.minLength(6)
                ]),
                'password_confirmation': new FormControl('', [
                    Validators.required,
                    Validators.minLength(6)
                ]),
                'tariffPlanId': new FormControl(4),
            },
            passwordConfirmation);
    }
}
