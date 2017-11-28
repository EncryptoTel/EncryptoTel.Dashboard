import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

import {RequestServices} from './request.services';
import {LoggerServices} from './logger.services';
import {StorageServices} from './storage.services';

import {CountryModel} from '../models/country.model';
import {CurrencyModel} from '../models/currency.model';

@Injectable()
export class ListServices {
  constructor(private _req: RequestServices,
              private _storage: StorageServices,
              private logger: LoggerServices) {}
  countriesList: CountryModel[] = [];
  countriesSubscription: Subject<CountryModel[]> = new Subject();
  currenciesList: CurrencyModel[] = [];
  currenciesSubscription: Subject<CurrencyModel[]> = new Subject();
  fetchCountries(): void {
    const countries = this._storage.readItem('pbx_countries');
    if (countries) {
      this.countriesList = countries;
      this.countriesSubscription.next(this.countriesList);
    } else {
      this._req.get('v1/countries').then(result => {
        this._storage.writeItem('pbx_countries', result.countries);
        this.countriesList = result.countries;
        this.countriesSubscription.next(this.countriesList);
      });
    }
  }
  fetchCurrencies(): void {
    const currencies = this._storage.readItem('pbx_currencies');
    if (currencies) {
      this.currenciesList = currencies;
      this.currenciesSubscription.next(this.currenciesList);
    } else {
      this._req.get('v1/currencies').then(result => {
        this._storage.writeItem('pbx_currencies', result.currencies);
        this.currenciesList = result.currencies;
        this.currenciesSubscription.next(this.currenciesList);
      });
    }
  }
  countries(): Observable<CountryModel[]> {
    return this.countriesSubscription.asObservable();
  }
  currencies(): Observable<CurrencyModel[]> {
    return this.currenciesSubscription.asObservable();
  }
}
