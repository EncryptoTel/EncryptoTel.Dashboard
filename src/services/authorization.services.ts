import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Subject} from 'rxjs/Subject';

import {RequestServices} from './request.services';
import {LoggerServices} from './logger.services';
import {UserServices} from './user.services';

import {SignInFormModel} from '../models/form-sign-in.model';
import {SignUpFormModel} from '../models/form-sign-up.model';
import {Observable} from 'rxjs/Observable';
import {PasswordChangingFormModel} from '../models/form-password-changing.model';
import {FormGroup} from '@angular/forms';
import {FormMessageModel} from '../models/form-message.model';
import {LocalStorageServices} from "./local-storage.services";

@Injectable()
export class AuthorizationServices {
    constructor(private router: Router,
                private _services: UserServices,
                private _req: RequestServices,
                private storage: LocalStorageServices,
                private logger: LoggerServices) {
    }

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
    setMessage(message: FormMessageModel): void {
        this.message = message;
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
                let URL = this.storage.readItem('pbx_url');
                if (URL && URL.startsWith('/cabinet/')) {
                    this.router.navigateByUrl(URL);
                }
                else {
                    this.router.navigateByUrl('/cabinet');
                }
            } else if (result && result.auth) {
                this.setMessage({
                    type: 'success',
                    message: result.message ? result.message : 'Confirmation code was sent to your e-mail address'
                });
                this.router.navigate(['/code-confirmation', result.hash]);
            }
        }).catch(result => {
            this.setMessage({
                type: 'error',
                message: result.message ? result.message : 'Unknown server error'
            });
        });
    }

    sendTemporaryPassword(data: object) {
        return this._req.post('password/temporary', {...data}, true).then(result => {
            this.setMessage({
                type: 'success',
                message: result.message ? result.message : 'Temporary password sent to your e-mail'
            });
            this.router.navigateByUrl('/');
        }).catch(result => {
            this.setMessage({
                type: 'error',
                message: result.message ? result.message : 'User not found'
            });
        });
    }

    /*
      Sign-in form submit. Accepted params:
      Confirmation Code: object - two-factor authentication code form values,
      Hash: string - user-specific hash
     */
    codeConfirm(confirmationCode: object, hash: string) {
        return this._req.post(`login/${hash}`, {...confirmationCode}, true).then(result => {
            this._services.saveUserData({secrets: result});
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
            this.setMessage({
                type: 'success',
                message: result.message
            });
            this.router.navigateByUrl('/');
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
        return this._req.post(`password/reset`, {...email}, true).then(result => {
            this.setMessage({
                type: 'success',
                message: result.message
            });
        }).catch(result => {
            this.setMessage({
                type: 'error',
                message: result.message ? result.message : result.error.code === 404 ? 'User not found' : 'Unknown server error'
            });
        });
    }

    /*
      Change password. Accepted params:
      Data - password changing form values,
      Hash: string - user-specific hash
     */
    changePassword(data: PasswordChangingFormModel, hash: string) {
        return this._req.post(`password/reset/${hash}`, {...data}, true).then(result => {
            this.setMessage({
                type: 'success',
                message: 'Password successfully changed'
            });
            this.router.navigateByUrl('/');
        }).catch(result => {
            this.setMessage({
                type: 'error',
                message: result.message ? result.message : 'Unknown server error'
            });
        });
    }

    /*
      Getting tariff plans list
     */
    getTariffPlans(): Promise<any> {
        return this._req.get('v1/tariff-plan/account', true);
    }
}
