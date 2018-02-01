import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';
import {RequestServices} from '../../services/request.services';
import {MessageServices} from '../../services/message.services';

@Component({
  selector: 'email-confirm',
  template: `<div class="auth_form"></div>`
})

export class EmailConfirmComponent implements OnInit, OnDestroy {
  constructor(private _route: ActivatedRoute,
              private _router: Router,
              private _messages: MessageServices,
              private _req: RequestServices) {}
  subscription: Subscription;
  ngOnInit() {
    this.subscription = this._route.params.subscribe(params => {
      if (params['hash']) {
        this._req.get(`confirm/email/${params['hash']}`).then(result => {
          this._messages.writeSuccess(result.message);
          this._router.navigateByUrl('/sign-in');
        }).catch(() => {
          this._messages.writeWarning('Invalid hash!');
          this._router.navigateByUrl('/');
        });
      } else {
        this._messages.writeWarning('Hash not presented!');
        this._router.navigateByUrl('/');
      }
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
