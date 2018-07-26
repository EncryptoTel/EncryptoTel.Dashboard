import {CountryModel} from "./country.model";

export class CompanyModel {
    constructor(public name: string,
                public email: string,
                public phone: string,
                public vatId: number,
                public companyAddress: CompanyAddress[],
                public companyDetailFieldValue?: any[],
                public id?: number) {
    }
}

export class CompanyAddress {
    constructor(public country: CountryModel,
                public postalCode: string,
                public regionName: string,
                public locationName: string,
                public street: string,
                public building: string,
                public office: string,
                public type?: null,
                public id?: number) {
    }
}

