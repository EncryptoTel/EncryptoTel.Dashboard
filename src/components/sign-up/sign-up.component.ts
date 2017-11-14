import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';

import {UserServices} from '../../services/user.services';

import {FadeAnimation} from '../../shared/fade-animation';
import * as _vars from '../../shared/vars';

/*
  Password match validation
 */

function passwordConfirmation(g: FormGroup) {
  return g.get('password').value === g.get('password-confirm').value
    ? null : {'mismatch': true};
}

@Component({
  selector: 'sign-up',
  templateUrl: 'template.html',
  animations: [FadeAnimation]
})
export class SignUpComponent implements OnInit {
  constructor(private router: Router,
              private _services: UserServices) {}
  loading = false;
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
    const confirm = this.signUpForm.controls['password-confirm'];
    if (this.signUpForm.errors && (confirm.touched || confirm.dirty)) {
      return this.signUpForm.errors.mismatch;
    } else {
      return false;
    }
  }
  /*
    Sign-up action
   */
  signUp(event): void {
    event.preventDefault();
    this.loading = true;
    this._services.signUp(this.signUpForm.value).then(() => {
      this.loading = false;
    });
  }
  ngOnInit(): void {
    if (this._services.fetchUser()) {
      this.router.navigateByUrl('/cabinet');
    }
    this.signUpForm = new FormGroup({
      'name': new FormControl(undefined, [
        Validators.required,
        Validators.pattern(_vars.nameRegExp)
      ]),
      'patronymic': new FormControl(undefined, [
        Validators.pattern(_vars.nameRegExp)
      ]),
      'surname': new FormControl(undefined, [
        Validators.required,
        Validators.pattern(_vars.nameRegExp)
      ]),
      'email': new FormControl(undefined, [
        Validators.required,
        Validators.pattern(_vars.emailRegExp)
      ]),
      'password': new FormControl(undefined, [
        Validators.required,
        Validators.minLength(6)
      ]),
      'password-confirm': new FormControl(undefined, [
        Validators.required,
        Validators.minLength(6)
      ]),
    }, passwordConfirmation);
  }
}
