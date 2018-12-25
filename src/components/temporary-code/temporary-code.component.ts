import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

import {FormMessageModel} from '@models/form-message.model';
import {UserServices} from '@services/user.services';
import {AuthorizationServices} from '@services/authorization.services';
import * as _vars from '@shared/vars';
import {validateForm, killEvent} from '@shared/shared.functions';
import {FadeAnimation} from '@shared/fade-animation';


@Component({
    selector: 'temporary-code',
    templateUrl: 'template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})
export class TemporaryCodeComponent implements OnInit, OnDestroy {

    loading: boolean = false;
    errorsSubscription: Subscription;
    message: FormMessageModel;
    temporaryCodeForm: FormGroup;
    errorForm: boolean = false;
    temporaryPasswordSent: boolean = false;


    constructor(private _router: Router,
        private _user: UserServices,
        public _services: AuthorizationServices) {
    }

    ngOnInit(): void {
        this._services.clearMessage();
        this.message = this._services.message;
        this.errorsSubscription = this._services.readMessage().subscribe(message => {
            this.message = message;
        });
        if (this._user.fetchUser()) {
            this._router.navigateByUrl('/cabinet');
        }
        this.temporaryCodeForm = new FormGroup({
            'email': new FormControl(null, [
                Validators.required,
                Validators.pattern(_vars.emailRegExp)
            ])
        });
    }

    ngOnDestroy(): void {
        this.errorsSubscription.unsubscribe();
    }

    get selectedEmail(): string {
        return this.temporaryCodeForm.value.email;
    }

    showForm(): boolean {
        return !this.temporaryPasswordSent;
    }

    inputValidation(name: string, errorType?: string): boolean {
        if (errorType) {
            const field = this.temporaryCodeForm.controls[name];
            return field.errors[errorType] && (field.dirty || field.touched);
        }
        else {
            const field = this.temporaryCodeForm.controls[name];
            return field.invalid && (field.dirty || field.touched);
        }
    }

    sendTemporaryPassword(): void {
        this._services.clearMessage();

        validateForm(this.temporaryCodeForm);
        if (this.temporaryCodeForm.valid) {
            this.errorForm = false;
            this.loading = true;
            this._services.sendTemporaryPassword(this.temporaryCodeForm.value)
                .then(() => {
                    if (this.message.type === 'error') {
                        this.errorForm = true;
                    }
                    else {
                        this._services.clearMessage();
                        this.temporaryPasswordSent = true;
                    }
                })
                .catch(() => {})
                .then(() => this.loading = false);
        }
        else {
            this.errorForm = true;
        }
    }

    back(): void {
        this._router.navigate([ 'sign-in' ]);
    }

    clearMessage(event?: KeyboardEvent): void {
        if (event.key) {
            this._services.clearMessage();
            this.errorForm = false;
        }
    }
}
