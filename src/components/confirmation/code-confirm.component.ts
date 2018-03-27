import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Subscription} from 'rxjs/Subscription';
import {ActivatedRoute} from '@angular/router';

import {AuthorizationServices} from '../../services/authorization.services';

import {FadeAnimation} from '../../shared/fade-animation';
import {validateForm} from '../../shared/shared.functions';
import {FormMessageModel} from '../../models/form-message.model';

@Component({
  selector: 'code-confirm',
  templateUrl: './code-confirm.template.html',
  animations: [FadeAnimation('300ms')]
})

export class CodeConfirmComponent implements OnInit, OnDestroy {
  constructor(private _route: ActivatedRoute,
              private _services: AuthorizationServices) {}
  loading = false;
  confirmationHash: string;
  message: FormMessageModel;
  confirmationCode: FormGroup;
  paramsSubscription: Subscription;
  errorsSubscription: Subscription;
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
  codeConfirm(ev?: Event): void {
    if (ev) { ev.preventDefault(); }
    validateForm(this.confirmationCode);
    if (this.confirmationCode.valid) {
      this.loading = true;
      this._services.codeConfirm(this.confirmationCode.value, this.confirmationHash).then(() => {
        this.loading = false;
      });
    }
  }
  clearMessage(ev?: KeyboardEvent): void {
    if (ev.key) {
      this._services.clearMessage();
    }
  }
  ngOnInit(): void {
    this.message = this._services.message;
    this.paramsSubscription = this._route.params.subscribe(params => {
      this.confirmationHash = params['hash'];
    });
    this.errorsSubscription = this._services.readMessage().subscribe(message => {
      this.message = message;
    });
    this.confirmationCode = new FormGroup({
      'code': new FormControl(null, [
        Validators.required
      ])
    });
  }
  ngOnDestroy(): void {
    this._services.clearMessage();
    this.paramsSubscription.unsubscribe();
    this.errorsSubscription.unsubscribe();
  }
}
