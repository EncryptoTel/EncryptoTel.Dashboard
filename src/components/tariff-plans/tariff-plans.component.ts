import {Component, OnInit} from '@angular/core';
import {TariffPlanServices} from '../../services/tariff-plan.services';

import {SwipeAnimation} from '../../shared/swipe-animation';
import {FadeAnimation} from '../../shared/fade-animation';
import {LocalStorageServices} from "../../services/local-storage.services";
import {UserServices} from "../../services/user.services";
import {ModalEx} from "../../elements/pbx-modal/pbx-modal.component";

@Component({
    selector: 'pbx-tariff-plans',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [SwipeAnimation('y', '300ms'), FadeAnimation('300ms')],
    providers: [TariffPlanServices]
})
export class TariffPlansComponent implements OnInit {
    tariffs: any[];
    current: any;
    selected: any;
    page: number;
    pageCount: number;
    pageSize: number = 4; // supposed to be unchangeable

    loading: boolean;
    modal: ModalEx;

    constructor(private _service: TariffPlanServices,
                private _storage: LocalStorageServices,
                private _user: UserServices) {
        this.tariffs = [];
        this.page = 1;
        this.modal = new ModalEx('', 'changeTariff');
    }

    ngOnInit(): void {
        this.getTariffsData();
        this.getCurrentTariff();
    }

    get pageItems(): any[] {
        let offset = (this.page - 1) * this.pageSize;
        return this.tariffs.slice(offset, offset + this.pageSize);
    }

    goBack(): void {
        if (this.page - 1 > 0) -- this.page;
    }
    
    goNext(): void {
        if (this.page + 1 <= this.pageCount) ++ this.page;
    }

    // isCurrent(tariff: any): boolean {
    //     return this.selected.id === tariff.id;
    // }

    choose(tariff: any): void {
        this.selected = tariff;
        this.modal.visible = true;
    }

    // tariffCost(tariff: any): string {
    //     return tariff.price > 0 ? 'From $' + tariff.price + '/monthly' : 'FREE';
    // }

    // tariffStatus(tariff: any): string {
    //     return this.current.id === tariff.id ? 'Subscribed' : (tariff.price > 0 ? 'Buy now' : 'Free');
    // }

    modalConfirm(): void {
        this.selected.loading = true;
        this._service.selectTariffPlan(this.selected.id).then(() => {
            this._user.fetchNavigationParams();
            this._user.fetchProfileParams().then(() => {
                this.current = this.selected;
                this.selected.loading = false;
            });
        }).catch(() => {
            this.selected.loading = false;
        });
    }

    getCurrentTariff(): void {
        const user = this._storage.readItem('pbx_user');
        this.current = user['profile']['tariffPlan'];
    }

    getTariffsData(): void {
        this.loading = true;
        this._service.getTariffPlans().then(response => {
            this.fillTraiffsData(response);
            this.initPageData();
            this.loading = false;
        }).catch(() => {
            this.loading = false;
        });
    }

    fillTraiffsData(tariffs: any): void {
        tariffs.map(tariff => {
            let price = 0;
            let services = [];
            tariff.offers.map(offer => {
                price += offer.service.sum;
                services.push({ title: offer.service.title });
            });
            price = Math.round(price * 100) / 100;
            this.tariffs.push({
                id: tariff.id,
                title: tariff.title,
                price: price,
                services: services
            });
        });
    }

    initPageData(): void {
        this.page = 1;
        this.pageCount = Math.ceil(this.tariffs.length / this.pageSize);
    }
}
