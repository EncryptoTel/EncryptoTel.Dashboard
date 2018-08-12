import {CountryModel} from "./country.model";
import { DatePipe } from '@angular/common';

export class CompanyModel {
    constructor(public name: string,
                public email: string,
                public phone: string,
                public vatId: number,
                public companyAddress: CompanyAddress[],
                public companyDetailFieldValue?: any[],
                public id?: number) {
    }

    get isValid(): boolean {
        return this.id > 0;
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

export class CompanyInfoModel {
    public logotype: string;
    public company: CompanyInfoItem[];
    public sectionGroups: CompanyInfoSectionGroup[];

    public setCompanyData(company: CompanyModel): void {
        this.company.forEach(item => {
            if (item.key) {
                item.value = this.eval(item.key, company, item.type);
            }
        });
    }

    public setSectionData(title: string, data: any): void {
        this.sectionGroups.forEach(group => {
            let section = group.sections.find(s => s.title == title);
            if (section) {
                section.items.forEach(item => {
                    if (item.key) {
                        item.value = this.eval(item.key, data, item.type);
                    }
                });
            }
        });
    }

    public setPhoneNumbersData(group: number, title: string, section: any): void {}

    private eval(property: string, data: any, type?: string): any {
        if (!data) return null;

        let matches = property.match(/^([^\.]+)\.(.*)$/);
        if (matches && matches.length == 3) {
            let baseProperty = matches[1];
            let restProperty = matches[2];
            let evalObj = null;

            matches = baseProperty.match(/(.+)\[(\d+)\]$/);
            if (matches && matches.length == 3 && data.propertyIsEnumerable(matches[1])) {
                baseProperty = matches[1];
                let index = matches[2];
                evalObj = data[baseProperty][index];
            }
            else {
                evalObj = data[baseProperty];
            }
            return this.eval(restProperty, evalObj, type);
        }
        else {
            if (data.hasOwnProperty(property)) {
                let value = data[property];
                switch (type) {
                    case 'date':
                        let datePipe = new DatePipe("en-US");
                        value = datePipe.transform(value, 'MMMM d, yyyy');
                        break;
                    // case 'phone':
                }
                return value;
            }
            return null;
        }
    }
}

export class CompanyInfoSectionGroup {
    public sections: CompanyInfoSection[];
}

export class CompanyInfoSection {
    public title: string;
    public cssClass: string;
    public items: CompanyInfoItem[];
}

export class CompanyInfoItem {
    public key: string;
    public title: string;
    public cssClass: string;
    public type: string;
    public value: any;
}
