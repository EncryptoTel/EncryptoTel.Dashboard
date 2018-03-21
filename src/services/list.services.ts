import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

import {RequestServices} from './request.services';
import {LoggerServices} from './logger.services';
import {StorageServices} from './storage.services';

import {CountryModel} from '../models/country.model';
import {CurrencyModel} from '../models/currency.model';
import {plainToClass} from 'class-transformer';

@Injectable()
export class ListServices {
  constructor(private _req: RequestServices,
              private _storage: StorageServices,
              private logger: LoggerServices) {}
  countriesList: CountryModel[];
  countriesSub: Subject<CountryModel[]> = new Subject<CountryModel[]>();
  currenciesList: CurrencyModel[];
  currenciesSub: Subject<CurrencyModel[]> = new Subject<CurrencyModel[]>();
  /*
    Fetch countries list if it's not in storage
   */
  fetchCountriesList(): Promise<CountryModel[]> {
    if (!this.fetchCountries()) {
      return this._req.get('countries.json').then(res => {
        this.countriesList = plainToClass(CountryModel, res['countries']);
        this._storage.writeItem('pbx_countries', this.countriesList);
        this.touchCountries();
        return Promise.resolve(this.countriesList);
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
      return this._req.get('currencies.json').then(res => {
        this.currenciesList = plainToClass(CurrencyModel, res['currencies']);
        this._storage.writeItem('pbx_currencies', this.currenciesList);
        this.touchCurrencies();
        return Promise.resolve(this.currenciesList);
      });
    } else {
      return Promise.resolve(this.fetchCurrencies());
    }
  }
  /*
    Fetch if countries list already in storage
   */
  fetchCountries(): CountryModel[] | null {
    if (this._storage.readItem('pbx_countries')) {
      return plainToClass(CountryModel, this._storage.readItem('pbx_countries'));
    } else {
      return null;
    }
  }
  /*
    Fetch if currencies list already in storage
   */
  fetchCurrencies(): CurrencyModel[] | null {
    if (this._storage.readItem('pbx_currencies')) {
      return plainToClass(CurrencyModel, this._storage.readItem('pbx_currencies'));
    } else {
      return null;
    }
  }
  /*
    Refresh countries list
   */
  touchCountries(): void {
    this.countriesList = this.fetchCountries();
    this.countriesSub.next(this.countriesList);
  }
  /*
    Refresh currencies list
   */
  touchCurrencies(): void {
    this.currenciesList = this.fetchCurrencies();
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
