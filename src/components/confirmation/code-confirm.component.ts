import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

import {AuthorizationServices} from '@services/authorization.services';
import {FadeAnimation} from '@shared/fade-animation';
import {validateForm, killEvent} from '@shared/shared.functions';
import {FormMessageModel} from '@models/form-message.model';


@Component({
    selector: 'code-confirm',
    templateUrl: './code-confirm.template.html',
    animations: [FadeAnimation('300ms')]
})
export class CodeConfirmComponent implements OnInit, OnDestroy {

    loading: boolean = false;
    confirmationHash: string;
    message: FormMessageModel;
    confirmationCode: FormGroup;
    paramsSubscription: Subscription;
    errorsSubscription: Subscription;
    errorForm: boolean;

    constructor(
        private _route: ActivatedRoute,
        private _services: AuthorizationServices
    ) {}

    ngOnInit(): void {
        this._services.clearMessage();
        this.message = this._services.message;
        this.paramsSubscription = this._route.params.subscribe(params => {
            this.confirmationHash = params['hash'];
        });
        this.errorsSubscription = this._services.readMessage().subscribe(message => {
            this.message = message;
        });
        this.confirmationCode = new FormGroup({
            'code': new FormControl(null, [Validators.required])
        });
    }

    ngOnDestroy(): void {
        this._services.clearMessage();
        this.paramsSubscription.unsubscribe();
        this.errorsSubscription.unsubscribe();
    }

    /*
      Form field validation. Accepted params:
      Name: string - form field name
     */
    inputValidation(name: string): boolean {
        const field = this.confirmationCode.controls[name];
        return field.invalid && (field.dirty || field.touched);
    }

    /*
      Code confirmation action
     */
    codeConfirm(event?: Event): void {
        killEvent(event);

        validateForm(this.confirmationCode);
        if (this.confirmationCode.valid) {
            this.loading = true;
            this.errorForm = false;
            this._services.codeConfirm(this.confirmationCode.value, this.confirmationHash).then(() => {
                if (this.message.type === 'error') {
                    this.errorForm = true;
                }
                else {
                    this._services.clearMessage();
                }
                this.loading = false;
            });
        }
        else {
            this.errorForm = true;
        }
    }

    clearMessage(): void {
        this._services.clearMessage();
        this.errorForm = false;
    }
}
