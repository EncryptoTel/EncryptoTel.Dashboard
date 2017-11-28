import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {MainViewComponent} from '../main-view.component';

import {MessageServices} from '../../services/message.services';
import {ListServices} from '../../services/list.services';

import {CountryModel} from '../../models/country.model';
import {CurrencyModel} from '../../models/currency.model';

@Component({
  selector: 'project-index',
  template: `
    <div class="index_wrap">
      <button name="Logout" class="button accent" (click)="logout()">Logout</button>
      <button name="Logout" class="button accent" (click)="switchTheme()">Switch theme</button>
      <pbx-select [options]="countriesList" [selected]="selectedCountry" (onSelect)="selectCountry($event)" [placeholder]="'Please select country'"></pbx-select>
      <pbx-select [options]="currenciesList" [selected]="selectedCurrency" (onSelect)="selectCurrency($event)" [placeholder]="'Please select currency'"></pbx-select>
    </div>
  `,
  styles: [`
    button{width: 100px; margin: auto auto 100px}
    button:not(:first-child){width: 150px; margin-top: 50px}
    pbx-select{width: 320px; margin: 50px auto 0}
    pbx-select:last-child{margin-bottom: auto}
    .index_wrap{display: flex; width: 100%; height: 100%; flex: 1 0 auto; flex-direction: column}
  `]
})

export class IndexComponent implements OnInit {
  constructor(private _list: ListServices,
              public _parent: MainViewComponent,
              private messages: MessageServices,
              private router: Router) {}
  countriesList: CountryModel[];
  currenciesList: CurrencyModel[];
  selectedCountry: CountryModel;
  selectedCurrency: CurrencyModel;
  logout() {
    localStorage.clear();
    this.messages.writeSuccess('Logout successful');
    return this.router.navigate(['../sign-in']);
  }
  selectCountry(country: CountryModel) {
    this.selectedCountry = country;
  }
  selectCurrency(currency: CurrencyModel) {
    this.selectedCurrency = currency;
  }
  switchTheme() {
    switch (this._parent.userTheme) {
      case 'dark_theme': {
        this._parent.setUserTheme('light_theme');
        break;
      }
      case 'light_theme': {
        this._parent.setUserTheme('dark_theme');
        break;
      }
    }
  }
  ngOnInit() {
    this._list.countries().subscribe(list => {
      this.countriesList = list;
    });
    this._list.currencies().subscribe(list => {
      this.currenciesList = list;
    });
    this._list.fetchCountries();
    this._list.fetchCurrencies();
  }
}
