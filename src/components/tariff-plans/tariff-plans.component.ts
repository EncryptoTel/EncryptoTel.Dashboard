import {Component, OnInit} from '@angular/core';
import {TariffPlanServices} from '../../services/tariff-plan.services';

import {SwipeAnimation} from '../../shared/swipe-animation';
import {FadeAnimation} from '../../shared/fade-animation';
import {StorageServices} from "../../services/storage.services";

@Component({
  selector: 'pbx-tariff-plans',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [SwipeAnimation('y', '300ms'), FadeAnimation('300ms')],
  providers: [TariffPlanServices]
})

export class TariffPlansComponent implements OnInit {
  constructor(private _service: TariffPlanServices,
              private _storage: StorageServices) {}

  loading = true;

  tariffs = [];
  // currentTariff = 2;
  currentPick = -1;
  page = 1;
  modalVisible: boolean;
  selected: any;

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
    // this.modalVisible = true;
    this._service.selectTariffPlan(tariff.id)
      .then(res => {
        console.log(res);
      }).catch();
  }

  tariffCost(tariff: any): string {
    return tariff.price > 0 ? 'From $' + tariff.price +'/monthly' : 'FREE';
  }

  tariffStatus(tariff: any): string {
    return this.getCurrentTariff().id === tariff.id ? 'Subscribed' : (tariff.price > 0 ? 'Buy now' : 'Free');
  }

  modalConfirm = (): void => {
    console.log('Modal confirmed!');
    this.modalVisible = false;
  }

  modalDecline = (): void => {
    console.log('Modal declined!');
    this.modalVisible = false;
  }

  ngOnInit(): void {
    this._service.getTariffPlans().then(res => {
      res.map(tariff => {
        this.tariffs.push({
          id: tariff.id,
          title: tariff.title,
          price: tariff.sum,
          services: []
        });
        tariff.offers.map(offer => {
          this.tariffs[this.tariffs.length - 1].services.push({
            title: offer.service.title
          });
        });
      });
      this.loading = false;
    }).catch();
  }

}
