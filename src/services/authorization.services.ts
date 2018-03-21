import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Subject} from 'rxjs/Subject';

import {RequestServices} from './request.services';
import {LoggerServices} from './logger.services';
import {MessageServices} from './message.services';
import {UserServices} from './user.services';

import {SignInFormModel} from '../models/form-sign-in.model';
import {SignUpFormModel} from '../models/form-sign-up.model';
import {Observable} from 'rxjs/Observable';
import {PasswordChangingFormModel} from '../models/form-password-changing.model';
import {FormGroup} from '@angular/forms';
import {FormMessageModel} from '../models/form-message.model';

@Injectable()
export class AuthorizationServices {
  constructor(private router: Router,
              private _messages: MessageServices,
              private _services: UserServices,
              private _req: RequestServices,
              private logger: LoggerServices) {}
  message: FormMessageModel;
  subscription: Subject<FormMessageModel> = new Subject<FormMessageModel>();
  signUpData: FormGroup;
  /*
    Service error reset to initial params
   */
  clearMessage(): void {
    this.message = null;
    this.subscription.next(this.message);
  }
  /*
    Service error subscription
   */
  readMessage(): Observable<FormMessageModel> {
    return this.subscription.asObservable();
  }
  /*
    Service error editing
   */
  setMessage(error: FormMessageModel): void {
    this.message = error;
    this.subscription.next(this.message);
  }
  /*
    Sign-in form submit. Accepted params:
    Data - sign in form values
   */
  signIn(data: SignInFormModel) {
    return this._req.post('login', {
      ...data
    }, true).then(result => {
      if (result && !result.auth) {
        this._services.saveUserData({secrets: result, image: 'http://via.placeholder.com/100x100'});
        this.router.navigateByUrl('/cabinet');
      } else if (result && result.auth) {
        this.router.navigate(['/code-confirmation', result.hash]);
      }
    }).catch(result => {
      this.setMessage({
        type: 'error',
        message: result.message ? result.message : 'Unknown server error'
      });
    });
  }
  /*
    Sign-in form submit. Accepted params:
    Confirmation Code: object - two-factor authentication code form values,
    Hash: string - user-specific hash
   */
  codeConfirm(confirmationCode: object, hash: string) {
    return this._req.post(`login/${hash}`, {...confirmationCode}).then(result => {
      this._services.saveUserData({secrets: result});
      this._messages.writeSuccess('Successfully logged in!');
      this.router.navigateByUrl('/cabinet');
      this.clearMessage();
    }).catch(result => {
      this.setMessage({
        type: 'error',
        message: result.message ? result.message : 'Unknown server error'
      });
    });
  }
  /*
    Sign-up form submit. Accepted params:
    Data - sign up form values
   */
  signUp(data: SignUpFormModel) {
    return this._req.post('registration', {
      ...data
    }, true).then(result => {
      this.router.navigateByUrl('/sign-in');
      this.setMessage({
        type: 'success',
        message: result.message
      });
    }).catch(result => {
      this.setMessage({
        type: 'error',
        message: (result.errors && result.errors.email) ? 'User already exist' : 'Internal server error'
      });
    });
  }
  /*
    Send password recovery e-mail. Accepted params:
    E-mail: string - user e-mail address form value
   */
  sendEmail(email: object) {
    return this._req.post(`password/email`, {...email}).then(result => {
      this._messages.writeSuccess(result.message);
    }).catch(result => {
      this.setMessage({
        type: 'error',
        message: result.message ? result.message : 'Unknown server error'
      });
    });
  }
  /*
    Change password. Accepted params:
    Data - password changing form values,
    Hash: string - user-specific hash
   */
  changePassword(data: PasswordChangingFormModel, hash: string) {
    return this._req.post(`password/reset/${hash}`, {...data}).then(result => {
      this._messages.writeSuccess(result.message);
      this.router.navigateByUrl('/');
    }).catch(result => {
      this.setMessage({
        type: 'error',
        message: result.message ? result.message : 'Unknown server error'
      });
    });
  }
}
