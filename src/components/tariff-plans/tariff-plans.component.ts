import {Component} from '@angular/core';
import {DBTariffPlanServices} from '../../services/db.tariff-plan.services';

import {SwipeAnimation} from '../../shared/swipe-animation';

@Component({
  selector: 'pbx-tariff-plans',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [SwipeAnimation('y', '200ms')],
  providers: [DBTariffPlanServices]
})

export class TariffPlansComponent {
  constructor(private _service: DBTariffPlanServices) {
    this._service.fetchTariffPlanDetails().then(res => {
      console.log(res);
    }).catch(err => {
      console.error(err);
    });
  }

  tariffs = [
    {
      id: 1,
      title: 'Basic',
      price: '',
      services: [
        {id: 1, title: 'Buy phones'},
        {id: 2, title: 'Call details'},
        {id: 3, title: 'Call records'}
      ]
    },
    {
      id: 2,
      title: 'Start',
      price: 15,
      services: [
        {id: 1, title: 'Buy phones'},
        {id: 2, title: 'Call details'},
        {id: 3, title: 'Call records'}
      ]
    },
    {
      id: 3,
      title: 'Medium',
      price: 15,
      services: [
        {id: 1, title: 'Buy phones'},
        {id: 2, title: 'Call details'},
        {id: 3, title: 'Call records'}
      ]
    },
    {
      id: 4,
      title: 'Maximum',
      price: 15,
      services: [
        {id: 1, title: 'Buy phones'},
        {id: 2, title: 'Call details'},
        {id: 3, title: 'Call records'},
        {id: 1, title: 'Buy phones'},
        {id: 2, title: 'Call details'},
        {id: 3, title: 'Call records'},
        {id: 1, title: 'Buy phones'},
        {id: 2, title: 'Call details'},
        {id: 3, title: 'Call records'}
      ]
    }
  ];
  currentTariff = 2;
  currentPick = 1;

  chooseTariff(id: number): void {
    this.currentTariff = id;
  }

  pickTariff(id: number): void {
    this.currentPick = id;
  }
}
