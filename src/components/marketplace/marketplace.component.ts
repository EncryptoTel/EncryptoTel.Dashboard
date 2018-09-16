import { Component, OnInit } from '@angular/core';
import { ModalEx } from "../../elements/pbx-modal/pbx-modal.component";
import { Module } from '../../models/module.model';
import { ModuleServices } from '../../services/module.services';
import { LocalStorageServices } from '../../services/local-storage.services';
import { MessageServices } from '../../services/message.services';
import { Lockable, Locker } from '../../models/locker.model';

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

    constructor(private _services: ModuleServices,
                private _message: MessageServices,
                private _storage: LocalStorageServices) {
            this.locker = new Locker();
    }

    ngOnInit(): void {
        this.getModulesList();
    }

    // -- event handlers ------------------------------------------------------

    modalConfirm = (): void => {
        this.selected.loading = true;
        this.locker.lock();
        this._services.buyService(this.selected.id).then(() => {
                this.selected.loading = false;
                this.locker.unlock();
                this.getModulesList();
        }).catch(() => {
            this.selected.loading = false;
            this.locker.unlock();
        });
    }

    buyService(module: Module): void {
        const currrentBalance = this.getBalance();
        if (currrentBalance.balance >= module.price) {
            this.modal.visible = true;
            this.selected = module;
        }
        else {
            this._message.writeError('Your account has insufficient funds to buy this service.');
        }
    }

    // -- data retrieval methods ----------------------------------------------

    getModulesList(): void {
        this.modules = [];
        this.locker.lock();
        this._services.getModulesList().then(result => {
            result.map(module => {
                if (module.service.marketPlace) {
                    this.modules.push({
                        id: module.service.id,
                        title: module.service.title,
                        content: module.service.description,
                        price: Math.round(module.currentPrice.sum * 100) / 100,
                        status: module.service.isUserBuy,
                        color: Math.round(Math.random() * 5 + 1) // TODO: required color in backend response
                    });
                }
            });
            this.modules = this.modules.sort((a: any, b: any) => {
                if (a.status && !b.status) return -1;
                else if (!a.status && b.status) return 1;
                else return 0;
            });
            this.locker.unlock();
        }).catch(() => {
            this.locker.unlock();
        });
    }

    getBalance() {
        const user = this._storage.readItem('pbx_user');
        console.log('balance', user);
        return user['balance'];
    }
}


