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
  countriesSub: Subject<CountryModel[]> = new Subject();
  currenciesList: CurrencyModel[] = [];
  currenciesSub: Subject<CurrencyModel[]> = new Subject();
  /*
    Fetch countries list if it's not in storage
   */
  fetchCountriesList(): Promise<CountryModel[]> {
    if (!this.fetchCountries()) {
      return this._req.get('countries.json').then(result => {
        this._storage.writeItem('pbx_countries', result['countries']);
        this.touchCountries();
        return Promise.resolve(result['countries']);
      });
    } else {
      return Promise.resolve(this.fetchCountries());
    }
  }
  /*
    Fetch currencies list if it's not in storage
   */
  fetchCurrenciesList(): Promise<CurrencyModel[]> {
    if (!this.fetchCurrencies()) {
      return this._req.get('currencies.json').then(result => {
        this._storage.writeItem('pbx_currencies', result['currencies']);
        this.touchCurrencies();
        return Promise.resolve(result['currencies']);
      });
    } else {
      return Promise.resolve(this.fetchCurrencies());
    }
  }
  /*
    Fetch if countries list already in storage
   */
  fetchCountries(): CountryModel[] {
    return this._storage.readItem('pbx_countries');
  }
  /*
    Fetch if currencies list already in storage
   */
  fetchCurrencies(): CurrencyModel[] {
    return this._storage.readItem('pbx_currencies');
  }
  /*
    Refresh countries list
   */
  touchCountries(): void {
    this.countriesList = this._storage.readItem('pbx_countries');
    this.countriesSub.next(this.countriesList);
  }
  /*
    Refresh currencies list
   */
  touchCurrencies(): void {
    this.currenciesList = this._storage.readItem('pbx_currencies');
    this.currenciesSub.next(this.currenciesList);
  }
  /*
    Countries list subscription
   */
  countriesSubscription(): Observable<CountryModel[]> {
    return this.countriesSub.asObservable();
  }
  /*
    Currencies list subscription
   */
  currenciesSubscription(): Observable<CurrencyModel[]> {
    return this.currenciesSub.asObservable();
  }
}
