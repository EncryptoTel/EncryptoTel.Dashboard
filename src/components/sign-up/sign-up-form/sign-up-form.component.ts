import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { AuthorizationServices } from '@services/authorization.services';
import { UserServices } from '@services/user.services';
import { MessageServices } from '@services/message.services';
import { FadeAnimation } from '@shared/fade-animation';
import { validateForm } from '@shared/shared.functions';
import { FormMessageModel } from '@models/form-message.model';


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
    byClicking: string;
    errorEmailMessage: string = '';
    errorPasswordMessage: string = '';

    // -- properties ----------------------------------------------------------

    get email(): string {
        const email = this.signUpForm.value.email;
        return email || '';
    }

    get signUpButtonText(): string {
        if (!this.tariffsLoading) {
            const plan = this.authorization.getSelectedTarifPlan();
            const suffix = plan && plan.sum > 0 ? '' : ' FREE';
            return this.translate.instant(`Start now${suffix}`);
        }
        return null;
    }

    get tariffPlanTitleText(): string {
        if (!this.tariffsLoading) {
            const plan = this.authorization.getSelectedTarifPlan();
            const suffix = plan && plan.title !== 'Basic' ? ' (7 days free)' : ' (Free)';
            return `${plan.title}${suffix}`;
        }
        return null;
    }

    // -- component lifecycle methods -----------------------------------------

    constructor(
        public router: Router,
        public user: UserServices,
        public authorization: AuthorizationServices,
        public translate: TranslateService,
        public messages: MessageServices
    ) {}

    ngOnInit(): void {
        this.byClicking = this.translate.instant('By clicking below, you agree to the EncryptoTel Terms of Service and ' )
                        + `&nbsp;<a href="/assets/pdf/${this.translate.currentLang}/EncryptoTel_Privacy_Policy.pdf">` + this.translate.instant('Privacy Policy') + '</a>';

        this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
            this.byClicking = this.translate.instant('By clicking below, you agree to the EncryptoTel Terms of Service and ')
                + `&nbsp;<a href="/assets/pdf/${this.translate.currentLang}/EncryptoTel_Privacy_Policy.pdf">` + this.translate.instant('Privacy Policy') + '</a>';
        });

        this.signUpCompleted = false;

        this.errorsSubscription = this.authorization.readMessage().subscribe(message => {
            this.message = message;
        });
        if (this.user.fetchUser()) {
            this.router.navigateByUrl('/cabinet');
        }
        if (this.authorization.signUpData) {
            this.signUpForm = this.authorization.signUpData;
        }
        if (!this.authorization.tariffPlans) {
            this.tariffsLoading = true;
            this.authorization.getTariffPlans()
                .then(() => {
                })
                .catch(() => {
                })
                .then(() => this.tariffsLoading = false);
        }
    }

    ngOnDestroy(): void {
        if (this.message && this.message.type === 'error') {
            this.authorization.clearMessage();
        }
        this.authorization.signUpData = this.signUpForm;
        this.errorsSubscription.unsubscribe();
    }

    // -- event handlers ------------------------------------------------------

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

    mouseEnter(element): void {
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

    mouseLeave(element): void {
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

    // -- form processing methods ---------------------------------------------

    /*
     Form field validation. Accepted params:
     Name: string - form field name,
     Error Type: string - validation type (not necessary)
    */
    inputValidation(name: string, errorType?: string): boolean {
        if (
            (this.errorEmailMessage !== '' && name === 'email')
            || (this.errorPasswordMessage !== '' && name === 'password')
        ) {
            return true;
        } else {
            if (errorType) {
                const field = this.signUpForm.controls[name];

                if (name === 'firstname' && errorType === 'firstLeterError') {
                    return !!field.errors['firstLeterError'];
                }

                return field && (field.errors[errorType] && !field.errors['firstLeterError']) && (field.dirty || field.touched);
            } else {
                const field = this.signUpForm.controls[name];
                return field && field.invalid && (field.dirty || field.touched);
            }
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

    // -- data retrieval methods ----------------------------------------------

    /*
     Sign-up action
    */
    signUp(event?: Event): void {
        this.errorCheck = false;
        this.errorEmailMessage = '';
        this.errorPasswordMessage = '';
        if (event) event.preventDefault();

        if (this.signUpForm.value.firstname.length > 0 && this.signUpForm.value.firstname[0] === '-' && this.signUpForm.value.firstname[0] === '_' && this.signUpForm.value.firstname[0] === '-') {

        }

        validateForm(this.signUpForm);
        if (this.signUpForm.valid) {
            this.loading = true;
            this.authorization.signUp(this.signUpForm.value)
                .then(() => {
                    this.signUpCompleted = true; // resend confirmation is shown
                })
                .catch((error) => {
                    if (error.errors.email) {
                        this.errorEmail = true;
                        this.errorEmailMessage = this.translate.instant('A user with this email address already exists');
                    }
                    if (error.errors.password) {
                        this.errorPassword = true;
                        this.errorPasswordMessage = this.translate.instant('Password and password confirmation must not consist of spaces.');
                    }
                })
                .then(() => this.loading = false);
        }
        else {
            if (this.inputValidation('firstname')) {
                this.errorName = true;
            }
            if ((this.inputValidation('email')) && (!this.errorName)) {
                this.errorEmail = true;
            }
            if ((this.inputValidation('password')) && (!this.errorEmail && !this.errorName)) {
                this.errorPassword = true;
            }
            if ((this.inputValidation('password_confirmation')) && (!this.errorPassword && !this.errorEmail && !this.errorName)) {
                this.errorConfirmPassword = true;
            }
            if (!this.errorConfirmPassword && !this.errorPassword && !this.errorEmail && !this.errorName) {
                this.errorCheck = true;
            }
        }
    }

    resendConfirmation(): void {
        this.loading = true;
        const email = this.signUpForm.value.email;
        this.authorization.resendConfirmation(email)
            .then(() => {
                const okMessage: string = this.translate.instant('Confirmation link has been succesfully resend to');
                this.messages.writeSuccess(`${okMessage} ${this.email}`);
            })
            .catch(error => {
                this.messages.writeError(error.message);
            })
            .then(() => this.loading = false);
    }
}
