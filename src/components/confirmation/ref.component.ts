import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';
import {RequestServices} from '../../services/request.services';
import {MessageServices} from '../../services/message.services';
import {AuthorizationServices} from '../../services/authorization.services';

@Component({
    selector: 'ref',
    template: `
        <div class="auth_form"></div>`
})

export class RefComponent implements OnInit, OnDestroy {
    constructor(private _route: ActivatedRoute,
                private _router: Router,
                private _services: AuthorizationServices,
                private message: MessageServices,
                private _req: RequestServices) {
    }

    subscription: Subscription;

    ngOnInit() {
        this.subscription = this._route.params.subscribe(params => {
            if (params['hash']) {
                this._req.get(`first-visit?ref=${params['hash']}`).then(result => {
                    localStorage.setItem('ref', params['hash']);
                    localStorage.setItem('uniqueHash', result.uniqueHash);
                    this._router.navigateByUrl('/sign-up');
                }).catch(() => {
                    this.message.writeError('Invalid Ref Link');
                    this._router.navigateByUrl('/sign-in');
                });
            } else {
                this.message.writeError('Ref Link is not presented');
                this._router.navigateByUrl('/sign-in');
            }
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
