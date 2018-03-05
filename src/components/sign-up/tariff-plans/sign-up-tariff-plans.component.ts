import {Component} from '@angular/core';
import {DBTariffPlanServices} from '../../../services/db.tariff-plan.services';
import {AuthorizationServices} from '../../../services/authorization.services';
import {Router} from '@angular/router';

@Component({
  selector: 'pbx-sign-up-tariff-plans',
  templateUrl: './template.html',
  styleUrls: ['./local.sass']
})

export class SignUpTariffPlansComponent {
  constructor(public _services: AuthorizationServices,
              private router: Router) {
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
  currentTariff = this._services.tariffId;

  chooseTariff(id: number): void {
    this._services.tariffId = id;
    this.currentTariff = id;
    this.router.navigate(['sign-up']);
  }
}
