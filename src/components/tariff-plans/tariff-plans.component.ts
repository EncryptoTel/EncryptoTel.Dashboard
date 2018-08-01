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
    loading = true;

    tariffs = [];
    page = 1;
    selected: any;

    modal = new ModalEx('', 'changeTariff');

    constructor(private _service: TariffPlanServices,
                private _storage: LocalStorageServices,
                private _user: UserServices) {

    }

    PageCount() {
        return Math.round(this.tariffs.length / 4) + (this.tariffs.length % 4 === 1 ? 1 : 0);
    }

    getCurrentTariff(): any {
        const user = this._storage.readItem('pbx_user');
        return user['profile']['tariffPlan'];
    }

    isCurrentTariff(tariff: any): boolean {
        return this.getCurrentTariff().id === tariff.id;
    }

    chooseTariff(tariff: any): void {
        this.selected = tariff;
        this.modal.visible = true;
    }

    tariffCost(tariff: any): string {
        return tariff.price > 0 ? 'From $' + tariff.price + '/monthly' : 'FREE';
    }

    tariffStatus(tariff: any): string {
        return this.getCurrentTariff().id === tariff.id ? 'Subscribed' : (tariff.price > 0 ? 'Buy now' : 'Free');
    }

    modalConfirm = (): void => {
        this.selected.loading = true;
        this._service.selectTariffPlan(this.selected.id).then(res => {
            this._user.fetchProfileParams().then(res => {
                this.selected.loading = false;
            });
        }).catch(() => {
            this.selected.loading = false;
        });
    }

    ngOnInit(): void {
        this._service.getTariffPlans().then(res => {
            res.map(tariff => {
                let price = 0;
                tariff.offers.map(offer => {
                    price += offer.service.sum;
                });
                price = Math.round(price * 100) / 100;
                this.tariffs.push({
                    id: tariff.id,
                    title: tariff.title,
                    price: price,
                    services: []
                });
                tariff.offers.map(offer => {
                    this.tariffs[this.tariffs.length - 1].services.push({
                        title: offer.service.title
                    });
                });
            });
            this.loading = false;
        }).catch(() => {
            this.loading = false;
        });
    }

}
