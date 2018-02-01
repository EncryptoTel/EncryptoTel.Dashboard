import {Component, OnInit} from '@angular/core';
import {MessageServices} from '../../services/message.services';
import {ListServices} from '../../services/list.services';
import {CountryModel} from '../../models/country.model';
import {CurrencyModel} from '../../models/currency.model';
import {LoggerServices} from '../../services/logger.services';

@Component({
  selector: 'pbx-dashboard',
  templateUrl: './template.html',
  styleUrls: ['./local.sass']
})

export class DashboardComponent implements OnInit {
  constructor(private _messages: MessageServices,
              private _list: ListServices,
              private _log: LoggerServices) {}
  countriesList: CountryModel[];
  currenciesList: CurrencyModel[];
  selectedCountry: CountryModel;
  selectedCurrency: CurrencyModel;
  selectCountry(country: CountryModel): void {
    this.selectedCountry = country;
  }
  selectCurrency(currency: CurrencyModel): void {
    this.selectedCurrency = currency;
  }
  ngOnInit() {
    this._list.countries().subscribe(list => {
      this._log.log('Countries list', list);
      this.countriesList = list;
    });
    this._list.currencies().subscribe(list => {
      this._log.log('Currencies list', list);
      this.currenciesList = list;
    });
    this._list.fetchCountries();
    this._list.fetchCurrencies();
  }
}
