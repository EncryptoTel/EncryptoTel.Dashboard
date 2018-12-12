import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Subscription} from 'rxjs/Subscription';

import {AuthorizationServices} from '@services/authorization.services';
import {FadeAnimation} from '@shared/fade-animation';
import {validateForm, killEvent} from '@shared/shared.functions';
import * as _vars from '@shared/vars';
import {FormMessageModel} from '@models/form-message.model';


@Component({
    selector: 'password-recovery',
    templateUrl: './template.html',
    animations: [FadeAnimation('300ms')],
    styleUrls: ['./local.sass']
})
export class PasswordRecoveryComponent implements OnInit, OnDestroy {
    
    loading = false;
    message: FormMessageModel;
    emailForm: FormGroup;
    errorsSubscription: Subscription;

    constructor(private _services: AuthorizationServices) {}

    /*
      Form field validation. Accepted params:
      Name: string - form field name
     */
    inputValidation(name: string, errorType?: string): boolean {
        if (errorType) {
            const field = this.emailForm.controls[name];
            return field.errors[errorType] && (field.dirty || field.touched);
        } else {
            const field = this.emailForm.controls[name];
            return field.invalid && (field.dirty || field.touched);
        }
    }

    /*
      Code confirmation action
     */
    sendEmail(ev?: Event): void {
        this._services.clearMessage();
        killEvent(event);

        validateForm(this.emailForm);
        if (this.emailForm.valid) {
            this.loading = true;
            this._services.sendEmail(this.emailForm.value)
                .then(() => {})
                .catch(() => {})
                .then(() => {
                    this.loading = false;
                });
        }
    }
    
    clearMessage(event?: KeyboardEvent): void {
        if (event.key) {
            this._services.clearMessage();
        }
    }

    isErrorMessage(message: any): boolean {
        return message && message.type && message.type === 'error';
    }

    onMessageChanged(message: any): void {
        if (this.isErrorMessage(message)) {
            this.emailForm.controls['email'].markAsTouched();
            this.emailForm.controls['email'].setErrors({ 'userNotFound': true });
        }
        else if (this.message != null && !this.isErrorMessage(message)) {
            this.emailForm.controls['email'].setErrors(null);
        }
        this.message = message;
    }

    ngOnInit(): void {
        this._services.clearMessage();
        this.message = this._services.message;
        this.errorsSubscription = this._services.readMessage()
            .subscribe(message => this.onMessageChanged(message));
        
            this.emailForm = new FormGroup({
            'email': new FormControl(null, [
                Validators.required,
                Validators.pattern(_vars.emailRegExp)
            ])
        });
    }

    ngOnDestroy(): void {
        this._services.clearMessage();
        this.errorsSubscription.unsubscribe();
    }
}
