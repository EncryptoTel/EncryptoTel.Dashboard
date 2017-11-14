import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';

import {UserServices} from '../../services/user.services';

import * as _vars from '../../services/vars';

@Component({
  selector: 'sign-up',
  templateUrl: 'template.html'
})

export class SignUpComponent implements OnInit {
  constructor(private router: Router,
              private _services: UserServices) {}
  loading: boolean = false;
  signUpForm: FormGroup;
  inputValidation(name: string, errorType?: string): boolean {
    if (errorType) {
      const field = this.signUpForm.controls[name];
      return field.errors[errorType] && (field.dirty || field.touched)
    } else {
      const field = this.signUpForm.controls[name];
      return field.invalid && (field.dirty || field.touched);
    }
  }
  signUp(event): void {
    event.preventDefault();
    this.loading = true;
    this._services.signUp(this.signUpForm.value).then(() => {this.loading = false});
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
    });
  }
}
