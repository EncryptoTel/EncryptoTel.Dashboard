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

@Injectable()
export class AuthorizationServices {
  constructor(private router: Router,
              private message: MessageServices,
              private _services: UserServices,
              private _req: RequestServices,
              private logger: LoggerServices) {}
  error: string;
  subscription: Subject<string> = new Subject();
  /*
    Service error reset to initial params
   */
  clearError(): void {
    this.error = null;
    this.subscription.next(this.error);
  }
  /*
    Service error subscription
   */
  readError(): Observable<string> {
    return this.subscription.asObservable();
  }
  /*
    Service error editing
   */
  writeError(error: string): void {
    this.error = error;
    this.subscription.next(this.error);
  }
  /*
    Sign-in form submit. Accepted params:
    Data - sign in form values
   */
  signIn(data: SignInFormModel) {
    return this._req.post('login', {
      ...data
    }).then(result => {
      if (result && !result.auth) {
        this._services.saveUserData({secrets: result});
        this.message.writeSuccess('Successfully logged in!');
        this.router.navigateByUrl('/cabinet');
      } else if (result && result.auth) {
        this.router.navigate(['/code-confirmation', result.hash]);
      }
    }).catch(result => {
      this.writeError(result.message);
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
      this.message.writeSuccess('Successfully logged in!');
      this.router.navigateByUrl('/cabinet');
      this.clearError();
    }).catch(result => {
      this.writeError(result.message);
    });
  }
  /*
    Sign-up form submit. Accepted params:
    Data - sign up form values
   */
  signUp(data: SignUpFormModel) {
    return this._req.post('register', {
      ...data
    }).then(result => {
      this.router.navigateByUrl('/');
    }).catch(result => {
      this.writeError(result.errors.email[0]);
    });
  }
  /*
    Send password recovery e-mail. Accepted params:
    E-mail: string - user e-mail address form value
   */
  sendEmail(email: object) {
    return this._req.post(`password/email`, {...email}).then(result => {
      this.message.writeSuccess(result.message);
    }).catch(result => {
      this.writeError(result.message);
    });
  }
  /*
    Change password. Accepted params:
    Data - password changing form values,
    Hash: string - user-specific hash
   */
  changePassword(data: PasswordChangingFormModel, hash: string) {
    return this._req.post(`password/reset/${hash}`, {...data}).then(result => {
      this.message.writeSuccess(result.message);
      this.router.navigateByUrl('/');
    }).catch(result => {
      this.writeError(result.message);
    });
  }
}
