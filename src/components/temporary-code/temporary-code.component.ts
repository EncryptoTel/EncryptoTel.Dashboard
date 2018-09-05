import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormMessageModel} from '../../models/form-message.model';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Subscription} from 'rxjs/Subscription';
import {UserServices} from '../../services/user.services';
import {Router} from '@angular/router';
import {AuthorizationServices} from '../../services/authorization.services';
import * as _vars from '../../shared/vars';
import {validateForm} from '../../shared/shared.functions';
import {FadeAnimation} from '../../shared/fade-animation';

@Component({
    selector: 'temporary-code',
    templateUrl: 'template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class TemporaryCodeComponent implements OnInit, OnDestroy {
    constructor(private _router: Router,
                private _user: UserServices,
                public _services: AuthorizationServices) {
    }

    loading = false;
    errorsSubscription: Subscription;
    message: FormMessageModel;
    temporaryCodeForm: FormGroup;
    errorForm: boolean = false;

    inputValidation(name: string, errorType?: string): boolean {
        if (errorType) {
            const field = this.temporaryCodeForm.controls[name];
            return field.errors[errorType] && (field.dirty || field.touched);
        } else {
            const field = this.temporaryCodeForm.controls[name];
            return field.invalid && (field.dirty || field.touched);
        }
    }

    sendTemporaryPassword(ev?: Event): void {
        if (ev) {
            ev.preventDefault();
        }
        validateForm(this.temporaryCodeForm);
        if (this.temporaryCodeForm.valid) {
            this.errorForm = false;
            this.loading = true;
            this._services.sendTemporaryPassword(this.temporaryCodeForm.value).then((data) => {
                this.loading = false;
                if (this.message.type === 'error') {
                    this.errorForm = true;
                }
            }).catch(() => {
                this.loading = false;
            });
        } else {
            this.errorForm = true;
        }
    }

    clearMessage(ev?: KeyboardEvent): void {
        if (ev.key) {
            this._services.clearMessage();
            this.errorForm = false;
        }
    }

    ngOnInit() {
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

    ngOnDestroy() {
        this.errorsSubscription.unsubscribe();
    }
}
