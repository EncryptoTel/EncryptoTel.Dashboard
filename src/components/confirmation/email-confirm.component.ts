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
  constructor(private route: ActivatedRoute,
              private router: Router,
              private messages: MessageServices,
              private _req: RequestServices) {}
  subscription: Subscription;
  ngOnInit() {
    this.subscription = this.route.params.subscribe(params => {
      if (params['hash']) {
        this._req.get(`confirm/email/${params['hash']}`).then(result => {
          this.messages.writeSuccess(result.message);
          this.router.navigateByUrl('/sign-in');
        }).catch(() => {
          this.messages.writeWarning('Invalid hash!');
          this.router.navigateByUrl('/');
        });
      } else {
        this.messages.writeWarning('Hash not presented!');
        this.router.navigateByUrl('/');
      }
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
