export class CountryModel {
    public title: string;

    constructor(public id: number,
                public code: string,
                public name: string,
                public phoneCode: string) {
    }
}
