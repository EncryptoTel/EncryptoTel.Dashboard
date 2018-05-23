import {Component, OnInit} from '@angular/core';
import {DBTariffPlanServices} from '../../services/db.tariff-plan.services';

import {SwipeAnimation} from '../../shared/swipe-animation';

@Component({
  selector: 'pbx-tariff-plans',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [SwipeAnimation('y', '200ms')],
  providers: [DBTariffPlanServices]
})

export class TariffPlansComponent implements OnInit {
  constructor(private _service: DBTariffPlanServices) {}

  loading: boolean;

  tariffs = [];
  currentTariff = 2;
  currentPick = 1;

  chooseTariff(id: number): void {
    this._service.selectTariffPlan(id)
      .then(res => {
        console.log(res);
      }).catch();
  }

  pickTariff(id: number): void {
    this.currentPick = id;
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
