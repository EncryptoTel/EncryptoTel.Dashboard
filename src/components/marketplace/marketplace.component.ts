import {Component, OnInit} from '@angular/core';

import {ModalEx} from "../../elements/pbx-modal/pbx-modal.component";
import {Module} from '../../models/module.model';
import {ModuleServices} from '../../services/module.services';
import {LocalStorageServices} from '../../services/local-storage.services';
import {MessageServices} from '../../services/message.services';
import {Lockable, Locker} from '../../models/locker.model';
import {UserServices} from '../../services/user.services';

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

    constructor(private services: ModuleServices,
                private message: MessageServices,
                private storage: LocalStorageServices,
                private userService: UserServices) {
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
        }
        else {
            this.message.writeError('Your account has insufficient funds to buy this service.');
        }
    }

    // -- data retrieval methods ----------------------------------------------

    getModulesList(): void {
        this.modules = [];
        this.locker.lock();
        this.services.getModulesList().then(response => {
            response.map(module => {
                if (module.service.marketPlace) {
                    this.modules.push({
                        id: module.service.id,
                        title: module.service.title,
                        content: module.service.description,
                        price: Math.round(module.currentPrice.sum * 100) / 100,
                        status: module.service.isUserBuy,
                        color: this.getModuleColor(module.service.title)
                    });
                }
            });
            this.modules = this.modules.sort((a: any, b: any) => {
                if (a.status && !b.status) return -1;
                else if (!a.status && b.status) return 1;
                else return a.title > b.title ? 1 : -1;
            });
        }).catch(() => {})
          .then(() => this.locker.unlock());
    }

    purchaseService = (): void => {
        this.selected.loading = true;
        this.locker.lock();
        this.services.buyService(this.selected.id).then(() => {
                this.getModulesList();

                this.userService.modulesChanged.emit();
        }).catch(() => {})
          .then(() => {
                this.selected.loading = false;
                this.locker.unlock(); 
          });
    }

    getModuleColor(moduleTitle: string): number {
        let title = moduleTitle.toLowerCase();
        if (title == 'call queues') return 2; // pink
        else if (title == 'call record') return 5; // cyan
        else if (title == 'call rules') return 2; // pink
        else if (title == 'company') return 2; // pink
        else if (title == 'ivr') return 2; // pink
        else if (title == 'ring groups') return 2; // pink
        else if (title == 'storage') return 6; // green
        else if (title == 'schedule') return 2; // pink
        else if (title == 'send sms messages') return 2; // pink
        // 4 - blue, 3 - violet
        return 4;
    }

    getBalance() {
        const user = this.storage.readItem('pbx_user');
        return user['balance'];
    }
}


