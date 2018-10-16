import {Component} from '@angular/core';
import {AuthorizationServices} from '../../services/authorization.services';
import {FormControl, FormGroup, Validators, FormBuilder} from '@angular/forms';
import * as _vars from '../../shared/vars';
import {passwordConfirmation} from '../../shared/password-confirmation';


@Component({
    selector: 'sign-up',
    template: '<router-outlet></router-outlet>'
})
export class SignUpComponent {

    constructor(private _services: AuthorizationServices,
                private _fb: FormBuilder) {

        this._services.signUpData = this._fb.group({
            firstname: [null, [Validators.required, Validators.pattern(_vars.nameRegExp)]],
            email: [null, [Validators.required, Validators.pattern(_vars.emailRegExp)]],
            password: [null, [Validators.required, Validators.minLength(6)]],
            password_confirmation: [null, [Validators.required, Validators.minLength(6)]],
            agreementConfirmation: [null, [Validators.required, Validators.requiredTrue]],
            tariffPlanId: [null],
        }, {
            validator: (formGroup: FormGroup) => {
                return passwordConfirmation(formGroup);
            }
        });

        // this._services.signUpData = new FormGroup({
        //         'firstname': new FormControl('', [
        //             Validators.required,
        //             Validators.pattern(_vars.nameRegExp)
        //         ]),
        //         'email': new FormControl('', [
        //             Validators.required,
        //             Validators.pattern(_vars.emailRegExp)
        //         ]),
        //         'password': new FormControl('', [
        //             Validators.required,
        //             Validators.minLength(6)
        //         ]),
        //         'password_confirmation': new FormControl('', [
        //             Validators.required,
        //             Validators.minLength(6)
        //         ]),
        //         'tariffPlanId': new FormControl(4),
        //     },
        //     passwordConfirmation);
    }
}
