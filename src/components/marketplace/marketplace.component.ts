import { Component, OnInit } from '@angular/core';
import { ModalEx } from "../../elements/pbx-modal/pbx-modal.component";
import { Module } from '../../models/module.model';
import { ModuleServices } from '../../services/module.services';
import { LocalStorageServices } from '../../services/local-storage.services';
import { MessageServices } from '../../services/message.services';

@Component({
    selector: 'pbx-marketplace',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [ModuleServices]
})

export class MarketplaceComponent implements OnInit {
    modules: Module[];
    selected: Module;
    modal = new ModalEx('', 'buyModule');

    constructor(
        private _services: ModuleServices,
        private _message: MessageServices,
        private _storage: LocalStorageServices) 
        {}

    ngOnInit(): void {
        this.getModulesList();
    }

    modalConfirm = (): void => {
        this.selected.loading = true;
        this._services.buyService(this.selected.id)
            .then(res => {
                this.selected.loading = false;
                this.getModulesList();
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

    getModulesList(): void {
        this.modules = [];
        this._services.getModulesList().then(res => {
            res.map(module => {
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
        }).catch();
    }

    getBalance() {
        const user = this._storage.readItem('pbx_user');
        console.log('balance', user);
        return user['balance'];
    }
}


