import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

import {AuthorizationServices} from '../../services/authorization.services';
import {UserServices} from '../../services/user.services';

import {FadeAnimation} from '../../shared/fade-animation';
import {passwordConfirmation} from '../../shared/password-confirmation';

@Component({
  selector: 'sign-up',
  templateUrl: './password-change.template.html',
  animations: [FadeAnimation('.3s')]
})
export class PasswordChangeComponent implements OnInit, OnDestroy {
  constructor(private _route: ActivatedRoute,
              private _user: UserServices,
              public _services: AuthorizationServices) {}
  loading = false;
  passwordChangingHash: string;
  error: string;
  passwordChangingForm: FormGroup;
  paramsSubscription: Subscription;
  errorsSubscription: Subscription;
  /*
    Form field validation. Accepted params:
    Name: string - form field name,
    Error Type: string - validation type (not necessary)
   */
  inputValidation(name: string, errorType?: string): boolean {
    if (errorType) {
      const field = this.passwordChangingForm.controls[name];
      return field.errors[errorType] && (field.dirty || field.touched);
    } else {
      const field = this.passwordChangingForm.controls[name];
      return field.invalid && (field.dirty || field.touched);
    }
  }
  /*
    Form passwords match validation.
   */
  passwordsMismatch(): boolean {
    const confirm = this.passwordChangingForm.controls['password_confirmation'];
    const password = this.passwordChangingForm.controls['password'];
    if (this.passwordChangingForm.errors && ((confirm.touched || confirm.dirty) || (password.touched || password.dirty))) {
      return this.passwordChangingForm.errors.mismatch;
    } else {
      return false;
    }
  }
  /*
    Change password action
   */
  changePassword(ev?: Event): void {
    if (ev) { ev.preventDefault(); }
    this.loading = true;
    this._services.changePassword(this.passwordChangingForm.value, this.passwordChangingHash).then(() => {
      this.loading = false;
    });
  }
  ngOnInit(): void {
    this._services.clearError();
    this._route.params.subscribe(params => {
      this.passwordChangingHash = params['hash'];
    });
    this.errorsSubscription = this._services.readError().subscribe(error => {
      this.error = error;
    });
    this.passwordChangingForm = new FormGroup({
      'password': new FormControl(null, [
        Validators.required,
        Validators.minLength(6)
      ]),
      'password_confirmation': new FormControl(),
    }, passwordConfirmation);
  }
  ngOnDestroy(): void {
    this._services.clearError();
    this.errorsSubscription.unsubscribe();
  }
}
