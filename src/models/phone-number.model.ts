import {CountryModel} from './country.model';
import {plainToClass} from 'class-transformer';
import {getCountryById} from '../shared/shared.functions';

export class PhoneNumberModel {
  public country_id: number;
  public number_prefix: number;
  public number: number;
  get fullNumber(): string {
    const country: CountryModel = plainToClass(CountryModel, getCountryById(this.country_id));
    return `+${country.phone_code} (${this.number_prefix}) ${this.number}`;
  }
}
