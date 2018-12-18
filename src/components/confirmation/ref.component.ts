import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';
import {RequestServices} from '../../services/request.services';
import {MessageServices} from '../../services/message.services';
import {AuthorizationServices} from '../../services/authorization.services';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'ref',
    template: `<div class="auth_form"></div>`
})

export class RefComponent implements OnInit, OnDestroy {
    constructor(private route: ActivatedRoute,
                private router: Router,
                private request: RequestServices,
                private message: MessageServices,
                protected translate: TranslateService) {
    }

    subscription: Subscription;

    ngOnInit() {
        this.subscription = this.route.params.subscribe(params => {
            if (params['hash']) {
                localStorage.removeItem('pbx_user');
                this.request.get(`first-visit?ref=${params['hash']}`, false).then(result => {
                    localStorage.setItem('ref', params['hash']);
                    localStorage.setItem('uniqueHash', result.uniqueHash);
                    this.router.navigateByUrl('/sign-up');
                }).catch(() => {
                    this.message.writeError(this.translate.instant('Ref Link not found or invalid'));
                    this.router.navigateByUrl('/sign-in');
                });
            } else {
                this.message.writeError(this.translate.instant('Ref Link is not presented'));
                this.router.navigateByUrl('/sign-in');
            }
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
