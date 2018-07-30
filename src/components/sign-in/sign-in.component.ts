import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

import {AuthorizationServices} from '../../services/authorization.services';
import {UserServices} from '../../services/user.services';

import {FadeAnimation} from '../../shared/fade-animation';
import {validateForm} from '../../shared/shared.functions';
import * as _vars from '../../shared/vars';
import {FormMessageModel} from '../../models/form-message.model';
import {MessageServices} from "../../services/message.services";

@Component({
    selector: 'sign-in',
    templateUrl: './template.html',
    animations: [FadeAnimation('300ms')],
    styleUrls: ['./local.sass']
})

export class SignInComponent implements OnInit, OnDestroy {
    constructor(private _router: Router,
                private _user: UserServices,
                public _services: AuthorizationServices,
                private _message: MessageServices) {
    }

    loading = false;
    errorsSubscription: Subscription;
    message: FormMessageModel;
    signInForm: FormGroup;

    /*
      Form field validation. Accepted params:
      Name: string - form field name,
      Error Type: string - validation type (not necessary)
     */
    inputValidation(name: string, errorType?: string): boolean {
        if (errorType) {
            const field = this.signInForm.controls[name];
            return field.errors[errorType] && (field.dirty || field.touched);
        } else {
            const field = this.signInForm.controls[name];
            return field.invalid && (field.dirty || field.touched);
        }
    }

    /*
      Sign-in action
     */
    signIn(ev?: Event): void {
        if (ev) {
            ev.preventDefault();
        }
        validateForm(this.signInForm);
        if (this.signInForm.valid) {
            this.loading = true;
            this._services.signIn(this.signInForm.value).then(() => {
                this.loading = false;
            }).catch(() => this.loading = false);
        }
    }

    clearMessage(ev?: KeyboardEvent): void {
        if (ev.key) {
            this._services.clearMessage();
        }
    }

    ngOnInit(): void {
        this.message = this._services.message;
        this.errorsSubscription = this._services.readMessage().subscribe(message => {
            this.message = message;
        });
        if (this._user.fetchUser()) {
            this._router.navigateByUrl('/cabinet');
        }
        this.signInForm = new FormGroup({
            'login': new FormControl('', [
                Validators.required,
                Validators.pattern(_vars.emailRegExp)
            ]),
            'password': new FormControl('', [
                Validators.required,
                Validators.minLength(6)
            ])
        });
        let msg = JSON.parse(localStorage.getItem('pbx_message'));
        localStorage.removeItem('pbx_message');
        if (msg) {
            console.log('SignInComponent', msg);
            if (msg.type === 'error') {
                this._message.writeError(msg.text);
            } else if (msg.type === 'success') {
                this._message.writeSuccess(msg.text);
            }
        }
    }

    ngOnDestroy(): void {
        this.errorsSubscription.unsubscribe();
    }
}
