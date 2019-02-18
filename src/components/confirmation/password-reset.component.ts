import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

import {AuthorizationServices} from '../../services/authorization.services';
import {UserServices} from '../../services/user.services';

import {FadeAnimation} from '../../shared/fade-animation';
import {passwordConfirmation} from '../../shared/password-confirmation';
import {validateForm} from '../../shared/shared.functions';
import {FormMessageModel} from '../../models/form-message.model';
import { MessageServices } from '@services/message.services';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'password-reset',
    templateUrl: './password-reset.template.html',
    animations: [FadeAnimation('300ms')]
})
export class PasswordResetComponent implements OnInit, OnDestroy {
    constructor(private _route: ActivatedRoute,
                private _user: UserServices,
                private _messages: MessageServices,
                public translate: TranslateService,
                public _services: AuthorizationServices) {
    }

    loading = false;
    passwordChangingHash: string;
    message: FormMessageModel;
    passwordChangingForm: FormGroup;
    paramsSubscription: Subscription;
    errorsSubscription: Subscription;

    /*
      Form field validation. Accepted params:
      Name: string - form field name,
      Error Type: string - validation type (not necessary)
     */
    inputValidation(name: string, errorType?: string): boolean {
        if (errorType) {
            const field = this.passwordChangingForm.controls[name];
            return field.errors[errorType] && (field.dirty || field.touched);
        } else {
            const field = this.passwordChangingForm.controls[name];
            return field.invalid && (field.dirty || field.touched);
        }
    }

    /*
      Form passwords match validation.
     */
    passwordsMismatch(): boolean {
        const confirm = this.passwordChangingForm.controls['password_confirmation'];
        const password = this.passwordChangingForm.controls['password'];
        if (this.passwordChangingForm.errors && ((confirm.touched || confirm.dirty) || (password.touched || password.dirty))) {
            return this.passwordChangingForm.errors.mismatch;
        } else {
            return false;
        }
    }

    /*
      Change password action
     */
    changePassword(ev?: Event): void {
        if (ev) {
            ev.preventDefault();
        }
        validateForm(this.passwordChangingForm);
        if (this.passwordChangingForm.valid) {
            this.loading = true;
            this._services.changePassword(this.passwordChangingForm.value, this.passwordChangingHash).then(() => {
                this.loading = false;
            }).catch(() => {
                this.loading = false;
            });
        }
    }

    ngOnInit(): void {
        this._services.clearMessage();
        this._route.params.subscribe(params => {
            this.passwordChangingHash = params['hash'];
        });
        this.errorsSubscription = this._services.readMessage().subscribe(message => {
            this.message = message;
        });
        this.passwordChangingForm = new FormGroup({
            'password': new FormControl(null, [
                Validators.required,
                Validators.minLength(6)
            ]),
            'password_confirmation': new FormControl(),
        }, passwordConfirmation);
    }

    ngOnDestroy(): void {
        this.errorsSubscription.unsubscribe();
    }
}
