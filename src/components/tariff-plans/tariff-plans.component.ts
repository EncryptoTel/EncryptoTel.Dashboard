import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { TariffPlanServices } from '../../services/tariff-plan.services';

import { SwipeAnimation } from '../../shared/swipe-animation';
import { FadeAnimation } from '../../shared/fade-animation';
import { LocalStorageServices } from '../../services/local-storage.services';
import { UserServices } from '../../services/user.services';
import { ModalEx, ModalButton } from '../../elements/pbx-modal/pbx-modal.component';
import { TariffStateService } from '../../services/state/tariff.state.service';
import { TranslateService } from '@ngx-translate/core';

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
    pageSize: number;

    loading: boolean;
    tariffChange: boolean;
    modal: ModalEx;

    constructor(
        private _service: TariffPlanServices,
        private _storage: LocalStorageServices,
        private _user: UserServices,
        private loadTariff: TariffStateService,
        public translate: TranslateService,
        private router: Router
    ) {
        this.pageSize = 4;
        this.tariffChange = true;
        this.tariffs = [];
        this.page = 1;
        this.modal = new ModalEx('', 'changeTariff');
    }

    ngOnInit(): void {
        this.getTariffsData();
        this.getCurrentTariff();
        this.loadTariff.change.subscribe(used => {
            this.tariffChange = used;
        });
    }

    get pageItems(): any[] {
        let offset: number;
        offset = (this.page - 1) * this.pageSize;
        return this.tariffs.slice(offset, offset + this.pageSize);
    }

    goBack(): void {
        if (this.page - 1 > 0) {
            --this.page;
        }
    }

    goNext(): void {
        if (this.page + 1 <= this.pageCount) {
            ++this.page;
        }
    }

    choose(tariff: any): void {
        if (this.tariffChange) {
            if (tariff.tariffPrice > this._user.user.balance.balance) {
                this.modal.title = this.translate.instant(this.modal.title);
                this.modal.body =
                    this.translate.instant('You do not have the required amount of money for changing your tariff plan.') + '<br/>' + this.translate.instant('Please refill your balance.');
                this.modal.buttons = [
                    new ModalButton('cancel', this.translate.instant('Cancel')),
                    new ModalButton('success', this.translate.instant('Refill'))
                ];
                this.modal.confirmCallback = () => {
                    this.router.navigate(['cabinet', 'refill']);
                };
                this.modal.visible = true;
            } else {
                this.selected = tariff;
                this.modal.visible = true;
            }
        }
    }

    modalConfirm(): void {
        this.loadTariff.load();
        this.selected.loading = true;
        this._service
            .selectTariffPlan(this.selected.id)
            .then(() => {
                this._user.fetchNavigationParams();
                this._user.fetchProfileParams().then(() => {
                    this.current = this.selected;
                    this.selected.loading = false;
                    this.loadTariff.unload();
                });
            })
            .catch(() => {
                this.selected.loading = false;
            });
    }

    getCurrentTariff(): void {
        const user = this._storage.readItem('pbx_user');
        this.current = user['profile']['tariffPlan'];
    }

    getTariffsData(): void {
        this.loading = true;
        this._service
            .getTariffPlans()
            .then(response => {
                this.fillTariffsData(response);
                this.initPageData();
                this.loading = false;
            })
            .catch(() => {
                this.loading = false;
            });
    }

    fillTariffsData(tariffs: any): void {
        tariffs.map(tariff => {
            let price = 0;
            let discountPrice = 0;
            let services: any;
            services = [];
            tariff.offers.map(offer => {
                price += offer.service.sum;
                discountPrice += offer.currentPrice.sum;
                services.push({
                    title: offer.service.title,
                    sort: offer.service.sort
                });
            });
            price = Math.round(price * 100) / 100;
            discountPrice = Math.round(discountPrice * 100) / 100;
            services.sort(this.compare);
            this.tariffs.push({
                id: tariff.id,
                title: this.translate.instant(tariff.title),
                tariffPrice: tariff.sum,
                price: price,
                discountPrice: discountPrice,
                services: services
            });
        });
    }

    compare(a, b) {
        const sortA = a.sort;
        const sortB = b.sort;

        let comparison = 0;
        if (sortA > sortB) {
            comparison = 1;
        } else if (sortA < sortB) {
            comparison = -1;
        }
        return comparison;
    }

    initPageData(): void {
        this.page = 1;
        this.pageCount = Math.ceil(this.tariffs.length / this.pageSize);
    }
}
