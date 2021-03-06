import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { ModalEx, ModalButton } from '@elements/pbx-modal/pbx-modal.component';
import { Module } from '@models/module.model';
import { Lockable, Locker } from '@models/locker.model';
import { ModuleServices } from '@services/module.services';
import { LocalStorageServices } from '@services/local-storage.services';
import { MessageServices } from '@services/message.services';
import { UserServices } from '@services/user.services';

@Component({
    selector: 'pbx-marketplace',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [ModuleServices]
})
export class MarketplaceComponent implements OnInit, Lockable {

    locker: Locker;
    modules: Module[];
    selected: Module;
    modal = new ModalEx('', 'buyModule');

    // -- component lifecycle methods -----------------------------------------

    constructor(
        private services: ModuleServices,
        private messages: MessageServices,
        private storage: LocalStorageServices,
        private router: Router,
        private userService: UserServices,
        public translate: TranslateService
    ) {
        this.locker = new Locker();
    }

    ngOnInit(): void {
        this.getModulesList();
    }

    // -- event handlers ------------------------------------------------------

    onServiceClick(module: Module): void {
        const currrentBalance = this.getBalance();
        if (currrentBalance.balance >= module.price) {
            this.modal.visible = true;
            this.selected = module;
        } else {
            this.modal.title = this.translate.instant(this.modal.title);
            this.modal.body =
                this.translate.instant('You don\'t have enough money to accomplish a purchase of this module.') + '<br/>' + this.translate.instant('Please refill your balance');
            this.modal.buttons = [
                new ModalButton('cancel', this.translate.instant('Cancel')),
                new ModalButton('success', this.translate.instant('Refill'))
            ];
            this.modal.confirmCallback = () => {
                this.router.navigate(['cabinet', 'refill']);
            };
            this.modal.visible = true;
        }
    }

    // -- data retrieval methods ----------------------------------------------

    getModulesList(): void {
        this.modules = [];
        this.locker.lock();
        this.services
            .getModulesList()
            .then(response => {
                response.map(module => {
                    if (module.service.marketPlace) {
                        this.modules.push({
                            id: module.service.id,
                            // title: module.service.title,
                            title: this.toUpperTitle(module.service.title),
                            content: module.service.description,
                            price:
                                Math.round(module.currentPrice.sum * 100) / 100,
                            status: module.service.isUserBuy,
                            buyWithOutTariff: module.service.isUserBuyWithOutTariff,
                            color: this.getModuleColor(module.service.title)
                        });
                    }
                });
                this.modules = this.modules.sort((a: any, b: any) => {
                    if (a.status && !b.status) return -1;
                    else if (!a.status && b.status) return 1;
                    else return a.title > b.title ? 1 : -1;
                });
                console.log(this.modules[0].title);
            })
            .catch(() => {})
            .then(() => this.locker.unlock());
    }

    // 2018-12-09-s
    toUpperTitle(title) {
        title = title.replace(/\b\w/g, char => char.toUpperCase());
        return title;
    }

    purchaseService(): void {
        this.selected.loading = true;
        this.locker.lock();
        this.services
            .buyService(this.selected.id)
            .then(() => {
                this.getModulesList();

                this.userService.modulesChanged.emit();
            })
            .catch(() => {})
            .then(() => {
                this.selected.loading = false;
                this.locker.unlock();
            });
    }

    getModuleColor(moduleTitle: string): number {
        let title: string;
        title = moduleTitle.toLowerCase();
        if (title === 'call queues') return 2;
        // pink
        else if (title === 'call record') return 5;
        // cyan
        else if (title === 'call rules') return 2;
        // pink
        else if (title === 'company') return 2;
        // pink
        else if (title === 'ivr') return 2;
        // pink
        else if (title === 'ring groups') return 2;
        // pink
        else if (title === 'storage') return 6;
        // green
        else if (title === 'schedule') return 2;
        // pink
        else if (title === 'send sms messages') return 2;
        // pink
        else if (title === 'audio conference') return 2; // violet
        // 4 - blue, 3 - violet
        return 4;
    }

    getBalance() {
        const user = this.storage.readItem('pbx_user');
        return user['balance'];
    }

    returnModule(module: Module) {
        this.modal.body = this.translate.instant(
            'Do you really want to unsubscribe from this module? Your data will be lost.'
        );
        this.modal.confirmCallback = () => {
            this.services.returnModule(module.id).then(() => {
                this.getModulesList();
                this.modal.body = this.translate.instant('Are you sure you want to buy this module?');
                this.modal.buttons = [
                    new ModalButton('cancel', this.translate.instant('Cancel')),
                    new ModalButton('success', this.translate.instant('Yes'))
                ];
                this.modal.confirmCallback = () => {
                    this.purchaseService();
                };
            });
        };
        this.modal.buttons = [
            new ModalButton('cancel', this.translate.instant('Cancel')),
            new ModalButton('error', this.translate.instant('Yes'))
        ];
        this.modal.visible = true;
    }
}
