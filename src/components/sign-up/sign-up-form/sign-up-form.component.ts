import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

import {AuthorizationServices} from '../../../services/authorization.services';
import {UserServices} from '../../../services/user.services';

import {FadeAnimation} from '../../../shared/fade-animation';
import {validateForm} from '../../../shared/shared.functions';
import {FormMessageModel} from '../../../models/form-message.model';
import {TimerObservable} from 'rxjs/observable/TimerObservable';

@Component({
    selector: 'sign-up-form',
    templateUrl: './template.html',
    animations: [FadeAnimation('.3s')],
    styleUrls: ['./local.sass']
})
export class SignUpFormComponent implements OnInit, OnDestroy {
    loading: boolean = false;
    tariffsLoading: boolean = false;
    errorsSubscription: Subscription;
    message: FormMessageModel;
    success: string;
    signUpForm: FormGroup;
    errorName: boolean = false;
    errorEmail: boolean = false;
    errorPassword: boolean = false;
    errorConfirmPassword: boolean = false;
    errorCheck: boolean = false;
    signUpCompleted: boolean;

    get email(): string {
        let email = this.signUpForm.value.email;
        return email || '';
    }

    constructor(private _router: Router,
                private _user: UserServices,
                public services: AuthorizationServices)
    {}

    setFocus(element): void {
        this.errorCheck = false;
        switch (element.name) {
            case 'Name':
                this.errorName = true;
                break;
            case 'E-mail':
                this.errorEmail = true;
                break;
            case 'Password':
                this.errorPassword = true;
                break;
            case 'Confirm password':
                this.errorConfirmPassword = true;
                break;
        }
    }

    removeFocus(element): void {
        switch (element.name) {
            case 'Name':
                this.errorName = false;
                break;
            case 'E-mail':
                this.errorEmail = false;
                break;
            case 'Password':
                this.errorPassword = false;
                break;
            case 'Confirm password':
                this.errorConfirmPassword = false;
                break;
        }
    }

    mouseEnter(element) {
        switch (element.name) {
            case 'Name':
                this.errorName = true;
                break;
            case 'E-mail':
                this.errorEmail = true;
                break;
            case 'Password':
                this.errorPassword = true;
                break;
            case 'Confirm password':
                this.errorConfirmPassword = true;
                break;
        }
    }

    mouseLeave(element) {
        if (document.activeElement === element) {
            return;
        }
        switch (element.name) {
            case 'Name':
                this.errorName = false;
                break;
            case 'E-mail':
                this.errorEmail = false;
                break;
            case 'Password':
                this.errorPassword = false;
                break;
            case 'Confirm password':
                this.errorConfirmPassword = false;
                break;
        }
    }

    get signUpButtonText(): string {
        if (!this.tariffsLoading) {
            const plan = this.services.getSelectedTarifPlan();
            const suffix = plan && plan.sum > 0 ? '' : ' FREE';
            return `Start now${suffix}`;
        }
        return null;
    }

    get tariffPlanTitleText(): string {
        if (!this.tariffsLoading) {
            const plan = this.services.getSelectedTarifPlan();
            const suffix = plan && plan.title != 'Basic' ? " (7 days free)" : ' (Free)';
            return `${plan.title}${suffix}`;
        }
        return null;
    }

    /*
     Form field validation. Accepted params:
     Name: string - form field name,
     Error Type: string - validation type (not necessary)
    */
    inputValidation(name: string, errorType?: string): boolean {
        if (errorType) {
            const field = this.signUpForm.controls[name];
            return field && field.errors[errorType] && (field.dirty || field.touched);
        }
        else {
            const field = this.signUpForm.controls[name];
            return field && field.invalid && (field.dirty || field.touched);
        }
    }

    /*
     Form passwords match validation.
    */
    passwordsMismatch(): boolean {
        const confirm = this.signUpForm.controls['password_confirmation'];
        const password = this.signUpForm.controls['password'];
        if (this.signUpForm.errors && ((confirm.touched || confirm.dirty) || (password.touched || password.dirty))) {
            return this.signUpForm.errors.mismatch;
        }
        else {
            return false;
        }
    }

    /*
     Sign-up action
    */
    signUp(event?: Event): void {
        this.errorCheck = false;
        if (event) event.preventDefault();

        validateForm(this.signUpForm);
        if (this.signUpForm.valid) {
            this.loading = true;
            this.services.signUp(this.signUpForm.value).then(() => {
                this.signUpCompleted = true; // resend confirmation is shown
            })
            .catch(() => {})
              .then(() => this.loading = false);
        } 
        else {
            if (this.inputValidation('firstname')) this.errorName = true;
            if ((this.inputValidation('email')) && (!this.errorName)) this.errorEmail = true;
            if ((this.inputValidation('password')) && (!this.errorEmail && !this.errorName)) this.errorPassword = true;
            if ((this.inputValidation('password_confirmation')) && (!this.errorPassword && !this.errorEmail && !this.errorName)) this.errorConfirmPassword = true;
            if (!this.errorConfirmPassword &&!this.errorPassword && !this.errorEmail && !this.errorName)
                this.errorCheck = true;
        }
    }

    resendConfirmation(): void {
        console.error('NotImplementedException() has been thrown');
        this.loading = true;
        let timer: Subscription = TimerObservable.create(1500, 0).subscribe(
            () => {
                timer.unsubscribe();
                this.loading = false;
            }
        );
    }

    ngOnInit(): void {
        this.signUpCompleted = false;

        this.errorsSubscription = this.services.readMessage().subscribe(message => {
            this.message = message;
        });
        if (this._user.fetchUser()) {
            this._router.navigateByUrl('/cabinet');
        }
        if (this.services.signUpData) {
            this.signUpForm = this.services.signUpData;
        }
        if (!this.services.tariffPlans) {
            this.tariffsLoading = true;
            this.services.getTariffPlans()
                .then(() => {})
                .catch(() => {})
                .then(() => this.tariffsLoading = false);
        }
    }

    ngOnDestroy(): void {
        if (this.message && this.message.type === 'error') {
            this.services.clearMessage();
        }
        this.services.signUpData = this.signUpForm;
        this.errorsSubscription.unsubscribe();
    }
}
