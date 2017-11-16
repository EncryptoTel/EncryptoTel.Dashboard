import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Subject} from 'rxjs/Subject';

import {RequestServices} from './request.services';
import {LoggerServices} from './logger.services';
import {MessageServices} from './message.services';
import {UserServices} from './user.services';

import {SignInFormModel} from '../models/form-sign-in.model';
import {SignUpFormModel} from '../models/form-sign-up.model';
import {AuthorizationStateModel} from '../models/authorization-state.model';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class AuthorizationServices {
  constructor(private router: Router,
              private message: MessageServices,
              private _services: UserServices,
              private _req: RequestServices,
              private logger: LoggerServices) {}
  state: AuthorizationStateModel = new AuthorizationStateModel();
  subscription: Subject<AuthorizationStateModel> = new Subject();
  /*
    Service state reset to initial params
   */
  stateReset(): void {
    this.state = new AuthorizationStateModel();
    this.subscription.next(this.state);
  }
  /*
    Authorization state subscription
   */
  readState(): Observable<AuthorizationStateModel> {
    return this.subscription.asObservable();
  }
  /*
    Authorization state params editing
   */
  changeState(param: string, value: string | boolean): void {
    this.state[param] = value;
    this.subscription.next(this.state);
  }
  /*
    Sign-in form submit. Accepted params:
    Data - sign in form values
   */
  signIn(data: SignInFormModel) {
    return this._req.post('login', {
      ...data
    }).then(result => {
      if (result) {
        this._services.saveUserData({secrets: result});
        this.message.writeSuccess('Successfully logged in!');
        this.router.navigateByUrl('/cabinet');
      }
    }).catch(result => {
      this.changeState('error', result.message);
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
      this.changeState('error', result.errors.email[0]);
    });
  }
}
