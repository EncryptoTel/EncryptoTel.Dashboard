import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {FormGroup} from '@angular/forms';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

import {RequestServices} from '@services/request.services';
import {LoggerServices} from '@services/logger.services';
import {UserServices} from '@services/user.services';
import {LocalStorageServices} from '@services/local-storage.services';
import {SignInFormModel} from '@models/form-sign-in.model';
import {SignUpFormModel} from '@models/form-sign-up.model';
import {PasswordChangingFormModel} from '@models/form-password-changing.model';
import {FormMessageModel} from '@models/form-message.model';


@Injectable()
export class AuthorizationServices {
    message: FormMessageModel;
    subscription: Subject<FormMessageModel> = new Subject<FormMessageModel>();
    signUpData: FormGroup;
    tariffPlans: any;
    error: any;

    constructor(private router: Router,
                private _services: UserServices,
                private _req: RequestServices,
                private storage: LocalStorageServices,
                private logger: LoggerServices) {
    }

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
        return this._req.post('login', {...data}, false).then(result => {
            if (result && !result.auth) {
                this._services.saveUserData({secrets: this._req.getSecrets(result)});
                const URL = this.storage.readItem('pbx_url');
                if (URL && URL.startsWith('/cabinet/')) {
                    this.router.navigateByUrl(URL);
                }
                else {
                    this.router.navigateByUrl('/cabinet');
                }
            } else if (result && result.auth) {
                // this.setMessage({
                //     type: 'success',
                //     message: result.message ? result.message : 'Confirmation code was sent to your e-mail address'
                // });
                this.router.navigate(['/code-confirmation', result.hash]);
            }
        }).catch(result => {
            if (result.errors) {
                return result;
            } else {
                this.setMessage({
                    type: 'error',
                    message: result.message ? result.message : 'Unknown server error'
                });
            }
        });
    }

    sendTemporaryPassword(data: object) {
        return this._req.post('password/temporary', {...data}, false).then(result => {
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
        return this._req.post(`login/${hash}`, {...confirmationCode}).then(result => {
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
        if (localStorage.getItem('ref') && localStorage.getItem('uniqueHash')) {
            data.ref = localStorage.getItem('ref');
            data.uniqueHash = localStorage.getItem('uniqueHash');
        }
        return this._req.post('registration', {
            ...data
        }).catch(error => {
            if (error.errors.firstname) {
                this.setMessage({
                    type: 'error',
                    message: error.errors.firstname[0]
                });
            } else {
                this.setMessage({
                    type: 'error',
                    message: (error.errors && error.errors.email) ? 'A user with this email address already exists' : 'Internal server error'
                });
            }
            return Promise.reject(error);
        });
    }

    /*
      Send password recovery e-mail. Accepted params:
      E-mail: string - user e-mail address form value
     */
    sendEmail(email: object) {
        return this._req.post(`password/reset`, {...email})
            .then(result => {
                this.setMessage({
                    type: 'success',
                    message: result.message
                });
            })
            .catch(result => {
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
        return this._req.post(`password/reset/${hash}`, {...data}).then(result => {
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
        return this._req.get('v1/tariff-plan/account').then(result => {
            this.tariffPlans = result;
            return Promise.resolve(result);
        });
    }

    getSelectedTarifPlan(): any {
        if (!this.tariffPlans) {
            console.error('Tariff plans are not obtained');
            return null;
        }
        if (!this.signUpData.controls.tariffPlanId) {
            console.error('Tariff plan is not selected');
            return null;
        }

        let tariffId = this.signUpData.controls.tariffPlanId.value;
        if (!tariffId) {
            const basicPlan = this.tariffPlans.find(tariff => tariff.title === 'Basic');
            tariffId = basicPlan.id;
            this.signUpData.controls.tariffPlanId.setValue(tariffId);
        }

        return this.tariffPlans.find(tariff => tariff.id === tariffId);
    }
}
