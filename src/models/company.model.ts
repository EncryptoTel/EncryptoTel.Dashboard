import {CountryModel} from './country.model';
import {DatePipe, DecimalPipe} from '@angular/common';
import { format } from 'util';

export class CompanyModel {
    constructor(public name: string,
                public logo: string,
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
    public logo: string;
    public company: CompanyInfoItem[];
    public sectionGroups: CompanyInfoSectionGroup[];

    public setCompanyData(company: CompanyModel): void {
        this.company.forEach(item => {
            if (item.key) {
                let evaluator = new CompanyInfoEvaluator(item, company);
                item.value = evaluator.value;
            }
        });
    }

    public setSectionData(title: string, data: any): void {
        this.sectionGroups.forEach(group => {
            let section = group.sections.find(s => s.title == title);
            if (section) {
                section.items.forEach(item => {
                    if (item.key) {
                        let evaluator = new CompanyInfoEvaluator(item, data);
                        item.value = evaluator.value;
                    }
                    else item.value = '-';
                });
            }
        });
    }

    public setPhoneNumbersData(title: string, data: any): void {
        this.sectionGroups.forEach(group => {
            let section = group.sections.find(s => s.title == title);
            if (section) {
                section.items = [];
                data.numbers.forEach(phone => {
                    let item = new CompanyInfoItem();
                    item.title = phone.phoneNumber;
                    item.value = `${phone.innerOnlineCount} of ${phone.innerCount}`;
                    item.value2 = phone.innerOnlineCount > 0 ? 'online' : 'offline';
                    section.items.push(item);
                });
            }
        });
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
    public value: any;
    public value2: any;

    public cssClass: string;
    public type: string;
    public format: string;
}

export class CompanyInfoEvaluator {
    private _baseData: any;
    private _item: CompanyInfoItem;
    private _value: string;

    get value(): string {
        return this._value;
    }

    constructor(item: CompanyInfoItem, data: any) {
        this._baseData = data;
        this._item = item;

        this._value = this.eval(this._item.key, this._baseData);
    }

    private eval(property: string, data: any, applyFormatting: boolean = true): any {
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
            return this.eval(restProperty, evalObj, applyFormatting);
        }
        else {
            let value = data[property];
            if (applyFormatting) {
                value = this.evalFormat(value, this._item.type, this._item.format);
            }
            return value;
        }
    }

    private evalFormat(value: any, type: string, format: string): any {
        let formatPipe;
        let args;

        switch (type) {
            case 'date':
                // --
                // Pattern: {DatePipeFormat}
                // --
                formatPipe = new DatePipe('en-US');
                format = format ? format : 'MMM d, yyyy';
                value = formatPipe.transform(value, format);
                break;
            case 'number':
                // --
                // Pattern: {minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}
                // --
                formatPipe = new DecimalPipe('en-US');
                format = format ? format : '1.0-0';
                value = formatPipe.transform(value, format);
                break;
            case 'currency':
                // --
                // Pattern: [ symbol | ${evalExpression} ] `|` {DecimalPipeFormat}
                // --
                args = format.split('|');
                if (args.length == 1) {
                    value = this.evalFormat(value, 'number', args[0]);
                }
                else {
                    let symbol = '';
                    let matches = args[0].match(/^\${([^}]+)}(\s*)/);
                    if (matches && matches.length) {
                        symbol = this.eval(matches[1], this._baseData, false);
                    }
                    else {
                        symbol = args[0];
                    }
                    let numberValue = this.evalFormat(value, 'number', args[1]);
                    return `${symbol}${numberValue}`;
                }
                break;
            case 'measure':
                // --
                // Pattern: {DecimalPipeFormat} `|` [ symbol | ${evalExpression} ]
                // --
                args = format.split('|');
                if (args.length == 1) {
                    value = this.evalFormat(value, 'number', args[0]);
                }
                else {
                    let symbol = '';
                    let matches = args[1].match(/^(\s*)\${([^}]+)}/);
                    if (matches && matches.length) {
                        symbol = this.eval(matches[2], this._baseData, false);
                        symbol = `${matches[1]}${symbol}`;
                    }
                    else {
                        symbol = args[1];
                    }
                    let numberValue = this.evalFormat(value, 'number', args[0]);
                    return `${numberValue}${symbol}`;
                }
                break;
            case 'phone':
                break;
        }
        return value;
    }
}
