import {Component, OnInit} from '@angular/core';
import {Module} from '../../models/module.model';
import {ModuleServices} from '../../services/module.services';
import {ModalEx} from "../../elements/pbx-modal/pbx-modal.component";

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

    constructor(private _services: ModuleServices) {

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
        this.modal.visible = true;
        this.selected = module;
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

    ngOnInit(): void {
        this.getModulesList();
    }
}


