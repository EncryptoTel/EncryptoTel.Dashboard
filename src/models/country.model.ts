export class CountryModel {

    constructor(public id: number,
                public code: string,
                public name: string,
                public phoneCode: string) {
    }

    get title(): string {
        return this.name;
    }

    set title(value: string) {
        this.name = value;
    }
}
