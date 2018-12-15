import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Subscription} from 'rxjs/Subscription';

import {AuthorizationServices} from '@services/authorization.services';
import {FadeAnimation} from '@shared/fade-animation';
import {validateForm, killEvent} from '@shared/shared.functions';
import * as _vars from '@shared/vars';
import {FormMessageModel} from '@models/form-message.model';
import {Router} from '@angular/router';


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
    resetLinkSent: boolean = false;

    get selectedEmail(): string {
        return this.emailForm.value.email;
    }

    showForm(): boolean {
        return !this.resetLinkSent;
    }

    constructor(
        private service: AuthorizationServices,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.service.clearMessage();
        this.message = this.service.message;
        this.errorsSubscription = this.service.readMessage()
            .subscribe(message => this.onMessageChanged(message));
        
            this.emailForm = new FormGroup({
            'email': new FormControl(null, [
                Validators.required,
                Validators.pattern(_vars.emailRegExp)
            ])
        });
    }

    ngOnDestroy(): void {
        this.service.clearMessage();
        this.errorsSubscription.unsubscribe();
    }

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
    sendEmail(event: Event): void {
        this.service.clearMessage();
        killEvent(event);

        validateForm(this.emailForm);
        if (this.emailForm.valid) {
            this.loading = true;
            this.service.sendEmail(this.emailForm.value)
                .then(() => {
                    if (this.service.message && this.service.message.type === 'success') {
                        this.resetLinkSent = true;
                    }
                })
                .catch(() => {})
                .then(() => {
                    this.loading = false;
                });
        }
    }

    back(): void {
        this.router.navigate([ 'sign-in' ]);
    }
    
    clearMessage(): void {
        this.service.clearMessage();
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
}
