import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';
import {CountryModel} from "../models/country.model";

@Injectable()
export class CountryServices {
    countries: CountryModel[] = [];

    constructor(private _req: RequestServices) {
    }

    getCountries(): Promise<CountryModel[]> {
        if (this.countries.length == 0) {
            return this._req.get(`v1/countries`, true).then(countries => {
                    this.countries = countries['countries'];
                    return Promise.resolve(this.countries);
                });
        } else {
            return Promise.resolve(this.countries);
        }
    }

}
