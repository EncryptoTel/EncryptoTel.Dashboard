import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';
import {CountryModel} from "../models/country.model";

@Injectable()
export class RefsServices {
    private countries: CountryModel[] = [];
    private sipOuters: any = [];

    constructor(private request: RequestServices) {

    }

    getCountries(): Promise<CountryModel[]> {
        if (this.countries.length == 0) {
            return this.request.get(`v1/countries`, true).then(countries => {
                this.countries = countries['countries'];
                return Promise.resolve(this.countries);
            });
        } else {
            return Promise.resolve(this.countries);
        }
    }

    getSipOuters(): Promise<any> {
        if (this.sipOuters.length == 0) {
            return this.request.get(`v1/sip/outers?limit=1000`, true).then(outers => {
                this.sipOuters = outers['items'];
                return Promise.resolve(this.sipOuters);
            });
        } else {
            return Promise.resolve(this.sipOuters);
        }
    }


}
