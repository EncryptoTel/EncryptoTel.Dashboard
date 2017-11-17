import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

import {AuthorizationServices} from '../../services/authorization.services';
import {UserServices} from '../../services/user.services';

import {FadeAnimation} from '../../shared/fade-animation';
import * as _vars from '../../shared/vars';

@Component({
  selector: 'sign-in',
  templateUrl: './template.html',
  animations: [FadeAnimation]
})

export class SignInComponent implements OnInit, OnDestroy {
  constructor(private router: Router,
              private _user: UserServices,
              public _services: AuthorizationServices) {}
  loading = false;
  errorsSubscription: Subscription;
  error: string;
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
    }).catch(() => this.loading = false);
  }
  ngOnInit(): void {
    this._services.clearError();
    this.errorsSubscription = this._services.readError().subscribe(error => {
      this.error = error;
    });
    if (this._user.fetchUser()) {
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
  ngOnDestroy(): void {
    this._services.clearError();
    this.errorsSubscription.unsubscribe();
  }
}
