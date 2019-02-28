import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { AuthorizationServices } from '@services/authorization.services';
import { UserServices } from '@services/user.services';
import { FadeAnimation } from '@shared/fade-animation';
import { validateForm, killEvent } from '@shared/shared.functions';
import * as _vars from '@shared/vars';
import { FormMessageModel } from '@models/form-message.model';
import { MessageServices } from '@services/message.services';
import { WsServices } from '@services/ws.services';
import { TranslateService } from '@ngx-translate/core';


export const RE_MAX_ATTEMPTS_MSG: RegExp = new RegExp(/^you have reached the maximum number of login attempts\. please try again after (\d{1,}) minutes?\.$/i);

@Component({
  selector: 'sign-in',
  templateUrl: './template.html',
  animations: [FadeAnimation('300ms')],
  styleUrls: ['./local.sass']
})
export class SignInComponent implements OnInit, OnDestroy {
  constructor(
    private _router: Router,
    private _user: UserServices,
    private _ws: WsServices,
    public _services: AuthorizationServices,
    private _message: MessageServices,
    private _translate: TranslateService) {
  }

  imageLoad: boolean = false;
  loading = false;
  errorsSubscription: Subscription;
  message: FormMessageModel;
  signInForm: FormGroup;
  errorName = false;
  errorPassword = false;
  passwordFormError = false;
  passwordFormErrorMessage: string = 'rqwerqwerqwerqwerqwer';

  setFocus(element): void {
    if (element.name === 'Username' && !this.isErrorMessage(this.message)) {
      switch (element.name) {
        case 'Username':
          this.errorName = true;
          break;
        case 'Password':
          this.errorPassword = true;
          break;
      }
    }
  }

  removeFocus(element): void {
    switch (element.name) {
      case 'Username':
        this.errorName = false;
        break;
      case 'Password':
        this.errorPassword = false;
        break;
    }
  }

  mouseEnter(element) {
    if (element.name === 'Username' && !this.isErrorMessage(this.message)) {
      switch (element.name) {
        case 'Username':
          this.errorName = true;
          break;
        case 'Password':
          this.errorPassword = true;
          break;
      }
    }
  }

  mouseLeave(element) {
    if (document.activeElement === element) {
      return;
    }
    switch (element.name) {
      case 'Username':
        this.errorName = false;
        break;
      case 'Password':
        this.errorPassword = false;
        break;
    }
  }

  /*
    Form field validation. Accepted params:
    Name: string - form field name,
    Error Type: string - validation type (not necessary)
   */
  inputValidation(name: string, errorType?: string): boolean {
    if (errorType) {
      const field = this.signInForm.controls[name];
      return field.errors && field.errors[errorType] && (field.dirty || field.touched);
    }
    else {
      const field = this.signInForm.controls[name];
      return (field.invalid && (field.dirty || field.touched));
    }
  }

  /*
    Sign-in action
   */
  signIn(event?: Event): void {
    this.passwordFormError = false;
    this._services.clearMessage();
    killEvent(event);

    validateForm(this.signInForm);
    if (this.signInForm.valid) {
      this.loading = true;
      this._services.signIn(this.signInForm.value)
        .then(response => {
          let errorKey: string = '';

          if (response && response.errors) {
            for (errorKey in response.errors) {
              if (errorKey === 'password') {
                this.passwordFormError = true;
                this.passwordFormErrorMessage = response.errors[errorKey][0];
              }
            }
          }
        })
        .catch(() => { })
        .then(() => this.loading = false);
    }
    else {
      if (this.inputValidation('login')) this.errorName = true;
      if (this.inputValidation('password') && !this.errorName) this.errorPassword = true;
    }
  }

  clearMessage(event?: KeyboardEvent): void {
    if (event.key) {
      this._services.clearMessage();
    }
  }

  isErrorMessage(message: any): boolean {
    return message && message.type && message.type === 'error';

  }

  onMessageChanged(message: any): void {
    if (this.isErrorMessage(message)) {
      this.signInForm.controls['login'].markAsTouched();
      this.signInForm.controls['login'].setErrors({ 'userNotFound': true });
    }
    else if (this.message != null && !this.isErrorMessage(message)) {
      this.signInForm.controls['login'].setErrors(null);
    }
    if (message && RE_MAX_ATTEMPTS_MSG.test(message.message)) {
      const matches = RE_MAX_ATTEMPTS_MSG.exec(message.message);
      message.message = this._translate.instant('maxLoginAttempts', { min: matches[1] });
    }
    this.message = message;
  }

  ngOnInit(): void {
    this._ws.close();

    if (this._services.message) {
      if (this._services.message.type === 'error') {
        this._message.writeError(this._services.message.message);
      }
      else {
        this._message.writeSuccess(this._services.message.message);
      }
    }

    this._services.clearMessage();
    this.message = this._services.message;
    this.errorsSubscription = this._services.readMessage()
      .subscribe(message => this.onMessageChanged(message));

    if (this._user.fetchUser()) {
      this._router.navigateByUrl('/cabinet');
    }

    this.signInForm = new FormGroup({
      'login': new FormControl('', [
        Validators.required,
        Validators.pattern(_vars.emailRegExp)
      ]),
      'password': new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(20)
      ])
    });

    const msg = JSON.parse(localStorage.getItem('pbx_message'));
    localStorage.removeItem('pbx_message');
    if (msg) {
      console.log('SignInComponent', msg);
      if (msg.type === 'error') {
        this._message.writeError(this._translate.instant(msg.text));
      } else if (msg.type === 'success') {
        this._message.writeSuccess(msg.text);
      }
    }
  }

  ngOnDestroy(): void {
    this.errorsSubscription.unsubscribe();
  }

  imageLoaded() {
    this.imageLoad = true;
  }
}
