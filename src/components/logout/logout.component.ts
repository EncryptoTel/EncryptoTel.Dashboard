import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

import {RefsServices} from '@services/refs.services';
import {WsServices} from '@services/ws.services';
import {MessageServices} from '@services/message.services';
import { UserServices } from '@services/user.services';
import { LocalStorageServices } from '@services/local-storage.services';


@Component({
    selector: 'log-out',
    template: ''
})
export class LogoutComponent implements OnInit {

    constructor(
        private refs: RefsServices,
        private ws: WsServices,
        private message: MessageServices,
        private translate: TranslateService,
        private storage: LocalStorageServices
    ) {}

    ngOnInit(): void {
        this.ws.close();
        this.refs.request.logout();
        this.storage.clear();
        this.message.writeSuccess(this.translate.instant('You have successfully logged out'));
    }
}
