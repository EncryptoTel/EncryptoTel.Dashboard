import {plainToClass} from 'class-transformer';
import {CountryModel} from '../models/country.model';
import {CurrencyModel} from '../models/currency.model';

export function getCountryById(id: number): CountryModel {
  const list: CountryModel[] = plainToClass(CountryModel, JSON.parse(localStorage.getItem('pbx_countries')));
  return list.find(country => country.id === id);
}

export function getCurrencyById(id: number): CurrencyModel {
  const list: CurrencyModel[] = plainToClass(CurrencyModel, JSON.parse(localStorage.getItem('pbx_currencies')));
  return list.find(currency => currency.id === id);
}

export function dateComparison(date0: Date, date1: Date) {
  return (date0.getMonth() === date1.getMonth()) && (date0.getDate() === date1.getDate());
}
