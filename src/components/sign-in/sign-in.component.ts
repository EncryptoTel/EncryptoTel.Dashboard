import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';

import {UserServices} from '../../services/user.services';

import {FadeAnimation} from '../../shared/fade-animation';
import * as _vars from '../../shared/vars';

@Component({
  selector: 'sign-in',
  templateUrl: 'template.html',
  animations: [FadeAnimation]
})

export class SignInComponent implements OnInit {
  constructor(private router: Router,
              private _services: UserServices) {}
  loading = false;
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
  signIn(event): void {
    event.preventDefault();
    this.loading = true;
    this._services.signIn(this.signInForm.value).then(() => {
      this.loading = false;
    });
  }
  ngOnInit(): void {
    if (this._services.fetchUser()) {
      this.router.navigateByUrl('/cabinet');
    }
    this.signInForm = new FormGroup({
      'username': new FormControl(undefined, [
        Validators.required,
        Validators.pattern(_vars.emailRegExp)
      ]),
      'password': new FormControl(undefined, [
        Validators.required,
        Validators.minLength(6)
      ])
    });
  }
}
