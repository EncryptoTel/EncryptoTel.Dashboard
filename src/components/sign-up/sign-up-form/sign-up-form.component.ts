import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

import {AuthorizationServices} from '../../../services/authorization.services';
import {UserServices} from '../../../services/user.services';

import {FadeAnimation} from '../../../shared/fade-animation';
import {passwordConfirmation} from '../../../shared/password-confirmation';
import {validateForm} from '../../../shared/shared.functions';
import * as _vars from '../../../shared/vars';
import {FormMessageModel} from '../../../models/form-message.model';

@Component({
  selector: 'sign-up-form',
  templateUrl: './template.html',
  animations: [FadeAnimation('.3s')]
})
export class SignUpFormComponent implements OnInit, OnDestroy {
  constructor(private _router: Router,
              private _user: UserServices,
              public _services: AuthorizationServices) {}
  loading = false;
  errorsSubscription: Subscription;
  message: FormMessageModel;
  success: string;
  signUpForm: FormGroup;
  /*
  Form field validation. Accepted params:
  Name: string - form field name,
  Error Type: string - validation type (not necessary)
 */
  inputValidation(name: string, errorType?: string): boolean {
    if (errorType) {
      const field = this.signUpForm.controls[name];
      return field.errors[errorType] && (field.dirty || field.touched);
    } else {
      const field = this.signUpForm.controls[name];
      return field.invalid && (field.dirty || field.touched);
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
    } else {
      return false;
    }
  }
  /*
    Sign-up action
   */
  signUp(ev?: Event): void {
    if (ev) { ev.preventDefault(); }
    validateForm(this.signUpForm);
    if (this.signUpForm.valid) {
      this.loading = true;
      this._services.signUp(this.signUpForm.value).then(() => {
        this.loading = false;
      }).catch(err => {
        this.loading = false;
      });
    }
  }
  ngOnInit(): void {
    this.errorsSubscription = this._services.readMessage().subscribe(message => {
      this.message = message;
    });
    if (this._user.fetchUser()) {
      this._router.navigateByUrl('/cabinet');
    }
    if (this._services.signUpData) {
      this.signUpForm = this._services.signUpData;
    } else {
      this.signUpForm = new FormGroup({
        'firstname': new FormControl(null, [
          Validators.required,
          Validators.pattern(_vars.nameRegExp)
        ]),
        'lastname': new FormControl(null, [
          Validators.pattern(_vars.nameRegExp)
        ]),
        'email': new FormControl(null, [
          Validators.required,
          Validators.pattern(_vars.emailRegExp)
        ]),
        'password': new FormControl(null, [
          Validators.required,
          Validators.minLength(6)
        ]),
        'tariff_plan_id': new FormControl(1),
        'password_confirmation': new FormControl(),
      }, passwordConfirmation);
    }
  }
  ngOnDestroy(): void {
    if (this.message && this.message.type === 'error') {
      this._services.clearMessage();
    }
    this._services.signUpData = this.signUpForm;
    this.errorsSubscription.unsubscribe();
  }
}
