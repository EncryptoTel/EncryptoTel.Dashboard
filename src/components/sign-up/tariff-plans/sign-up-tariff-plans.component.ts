import {Component, OnInit} from '@angular/core';
import {AuthorizationServices} from '../../../services/authorization.services';
import {Router} from '@angular/router';
import {SwipeAnimation} from '../../../shared/swipe-animation';
import {FadeAnimation} from '../../../shared/fade-animation';

@Component({
    selector: 'pbx-sign-up-tariff-plans',
    templateUrl: './template.html',
    animations: [SwipeAnimation('y', '300ms'), FadeAnimation('300ms')],
    styleUrls: ['./local.sass']
})

export class SignUpTariffPlansComponent implements OnInit {
    loading: boolean;
    current_pick = -1;
    tariffs = [];

    constructor(
        public services: AuthorizationServices,
        private _router: Router) {
    }

    chooseTariff(id: number): void {
        this.services.signUpData.controls['tariffPlanId'].setValue(id);
        this._router.navigate(['sign-up']);
    }

    ngOnInit(): void {
        this.loading = true;
        this.services.getTariffPlans()
            .then(res => {
                res.map(tariff => {
                    let servicePrice = 0;
                    let discountPrice = 0;
                    let tariffPrice = 0;

                    tariff.offers.map(offer => {
                        servicePrice += offer.service.sum;
                        discountPrice += offer.currentPrice.sum;
                    });
                    servicePrice = Math.round(servicePrice * 100) / 100;
                    discountPrice = Math.round(discountPrice * 100) / 100;
                    tariffPrice = Math.round(tariff.sum * 100) / 100;
                    this.tariffs.push({
                        id: tariff.id,
                        title: tariff.title,
                        tariffPrice: tariffPrice,
                        servicePrice: servicePrice,
                        discountPrice: discountPrice,
                        services: []
                    });
                    tariff.offers.map(offer => {
                        this.tariffs[this.tariffs.length - 1].services.push({
                            title: offer.service.title
                        });
                    });
                });
                this.loading = false;
            })
            .catch();
    }
}
