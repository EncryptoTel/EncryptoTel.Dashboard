export class CountryModel {
    title: string;

    constructor(public id: number,
                public code: string,
                public name: string,
                public phone_code: string) {
    }
}
