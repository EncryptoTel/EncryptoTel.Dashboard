import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Subscription} from 'rxjs/Subscription';

import {AuthorizationServices} from '../../services/authorization.services';

import {FadeAnimation} from '../../shared/fade-animation';
import {validateForm} from '../../shared/shared.functions';
import * as _vars from '../../shared/vars';
import {FormMessageModel} from '../../models/form-message.model';

@Component({
  selector: 'password-recovery',
  templateUrl: './template.html',
  animations: [FadeAnimation('300ms')]
})

export class PasswordRecoveryComponent implements OnInit, OnDestroy {
  constructor(private _services: AuthorizationServices) {}
  loading = false;
  message: FormMessageModel;
  emailForm: FormGroup;
  errorsSubscription: Subscription;
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
    if (ev) { ev.preventDefault(); }
    validateForm(this.emailForm);
    if (this.emailForm.valid) {
      this.loading = true;
      this._services.sendEmail(this.emailForm.value).then(() => {
        this.loading = false;
      });
    }
  }
  ngOnInit(): void {
    this._services.clearMessage();
    this.errorsSubscription = this._services.readMessage().subscribe(message => {
      this.message = message;
    });
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
