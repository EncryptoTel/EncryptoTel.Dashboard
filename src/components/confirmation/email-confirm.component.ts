import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';
import {RequestServices} from '../../services/request.services';
import {MessageServices} from '../../services/message.services';
import {AuthorizationServices} from '../../services/authorization.services';

@Component({
  selector: 'email-confirm',
  template: `<div class="auth_form"></div>`
})

export class EmailConfirmComponent implements OnInit, OnDestroy {
  constructor(private _route: ActivatedRoute,
              private _router: Router,
              private _services: AuthorizationServices,
              private _messages: MessageServices,
              private _req: RequestServices) {}
  subscription: Subscription;
  ngOnInit() {
    this.subscription = this._route.params.subscribe(params => {
      if (params['hash']) {
        this._req.get(`registration/confirm/${params['hash']}`).then(result => {
          this._services.setMessage({type: 'success', message: 'E-mail confirmed'});
          this._router.navigateByUrl('/sign-in');
        }).catch(() => {
          this._services.setMessage({type: 'error', message: 'Invalid hash'});
          this._router.navigateByUrl('/sign-in');
        });
      } else {
        this._services.setMessage({type: 'error', message: 'Hash is not presented'});
        this._router.navigateByUrl('/sign-in');
      }
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
