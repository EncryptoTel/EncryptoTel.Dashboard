import { FormArray, FormGroup } from '@angular/forms';
import { ElementRef, Component, isDevMode } from '@angular/core';
import { DatePipe } from '@angular/common';
import { plainToClass } from 'class-transformer';

import { CountryModel } from '@models/country.model';
import { CurrencyModel } from '@models/currency.model';
import { environment } from '@env/environment';
import { numberRegExp } from './vars';
import * as moment from 'moment';

const formatDateUser = 'MMM D, YYYY';
const formatDateTimeUser = 'MMM D, YYYY HH:mm:ss';
const formatDateServer = 'YYYY-MM-DD HH:mm:ss.s';
const formatDateServer2 = 'YYYY-MM-DD HH:mm:ss';

export function getCountryById(id: number): CountryModel {
    const list: CountryModel[] = plainToClass(
        CountryModel,
        JSON.parse(localStorage.getItem('pbx_countries'))
    );
    return list ? list.find(country => country.id === id) : null;
}

export function getCurrencyById(id: number): CurrencyModel {
    const list: CurrencyModel[] = plainToClass(
        CurrencyModel,
        JSON.parse(localStorage.getItem('pbx_currencies'))
    );
    return list ? list.find(currency => currency.id === id) : null;
}

export function dateComparison(date0: string, date1: Date) {
    // const date0 = moment(date0, ['YYYY-MM-DD HH:mm:ss']).format('Y-MM-DD HH:mm:ss');
    return (
        date0 === date1
    );
}

export function stringToDate(value) {
      return moment(value, [formatDateServer, formatDateServer2]).toDate();
}

// export function validateForm(form: FormGroup): void {
//     form.updateValueAndValidity();
//     this.validateFormControls(form);
// }

export function validateForm(form: FormGroup): void {
    form.updateValueAndValidity();
    Object.keys(form.controls).forEach(field => {
        const control = form.get(field);
        control.markAsTouched();
        if (control instanceof FormArray) {
            const controlsArray = control as FormArray;
            controlsArray.controls.forEach((ctrl: FormGroup) => {
                ctrl.markAsTouched();
                if (ctrl.controls) {
                    Object.keys(ctrl.controls).forEach(key => {
                        ctrl.get(key).markAsTouched();
                    });
                }
            });
        }
    });
}

export function validateFormControls(form: FormGroup | FormArray): void {
    Object.keys(form.controls).forEach(field => {
        const control = form.get(field);
        control.markAsTouched({ onlySelf: true });
        if (control instanceof FormGroup || control instanceof FormArray) {
            validateFormControls(control);
        }
    });
}

export function calculateHeight(
    table: ElementRef,
    row: ElementRef,
    row2?: ElementRef
): number {
    const height = row2
        ? table.nativeElement.clientHeight -
          (row.nativeElement.clientHeight +
              +getComputedStyle(row.nativeElement).marginBottom.split('px')[0] +
              (row2.nativeElement.clientHeight +
                  +getComputedStyle(row2.nativeElement).marginTop.split(
                      'px'
                  )[0]))
        : table.nativeElement.clientHeight -
          (row.nativeElement.clientHeight +
              +getComputedStyle(row.nativeElement).marginBottom.split(
                  'px'
              )[0]) *
              2;
    return Math.round((height - (height % 41)) / 41) - 1;
}

export function compareValues(key: string, order: string = 'asc') {
    return (a, b) => {
        const varA = evalByKey(key, a);
        const varB = evalByKey(key, b);

        let comparison = 0;
        if (varA > varB) {
            comparison = 1;
        } else if (varA < varB) {
            comparison = -1;
        }

        return order === 'desc' ? comparison * -1 : comparison;
    };
}

export function evalByKey(key: string, variable: any): any {
    let value = 0;
    if (variable.hasOwnProperty(key)) {
        value =
            typeof variable[key] === 'string'
                ? variable[key].toUpperCase()
                : variable[key];
    }
    return value;
}

export function formatDate(value: string): string {
    const date = moment(value, [formatDateServer]);
    return date.format(formatDateUser);
}

export function formatDateTime(value: string): string {
    const date = moment(value, [formatDateServer]);
    return date.format(formatDateTimeUser);
}

export function getInterval(items, dateAttr, displayAttr): string {
    let max = null;
    let min = null;
    for (const i in items) {
        if (items.hasOwnProperty(i)) {
            const item = items[i];
            min = !min || item[dateAttr] < min[dateAttr] ? item : min;
            max = !max || item[dateAttr] > max[dateAttr] ? item : max;
        }
    }
    return max && min ? `${min[displayAttr]} - ${max[displayAttr]}` : '';
}

export function getDateRange(items, dateAttr): string[] {
    let max = null;
    let min = null;
    for (const i in items) {
        if (items.hasOwnProperty(i)) {
            const item = items[i];
            min = !min || item[dateAttr] < min[dateAttr] ? item : min;
            max = !max || item[dateAttr] > max[dateAttr] ? item : max;
        }
    }
    return [ dateFromServerFormat(min[dateAttr]), dateFromServerFormat(max[dateAttr]) ];
}

export function dateToServerFormat(srcDate: string): string {
    const dateParts: string[] = srcDate.split('/');
    return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
}

export function dateFromServerFormat(srcDate: Date): string {
    const date = moment(srcDate, [formatDateServer]);
    return date.format('DD/MM/YYYY').toString();
}

export function str2regexp(pattern: string): RegExp {
    const parts = pattern.split('/');
    if (parts.length === 3) return new RegExp(parts[1], parts[2]);

    return new RegExp(pattern);
}

export function AnimationComponent(extendedConfig: Component = {}) {
    return function(target: Function) {
        const ANNOTATIONS = '__annotations__';
        const PARAMETERS = '__paramaters__';
        const PROP_METADATA = '__prop__metadata__';

        const annotations = target[ANNOTATIONS] || [];
        const parameters = target[PARAMETERS] || [];
        const propMetadata = target[PROP_METADATA] || [];

        if (annotations.length > 0) {
            const parentAnnotations = Object.assign({}, annotations[0]);

            Object.keys(parentAnnotations).forEach(key => {
                if (parentAnnotations.hasOwnProperty(key)) {
                    if (!extendedConfig.hasOwnProperty(key)) {
                        extendedConfig[key] = parentAnnotations[key];
                        annotations[0][key] = '';
                    } else {
                        if (extendedConfig[key] === parentAnnotations[key]) {
                            annotations[0][key] = '';
                        }
                    }
                }
            });
        }
        return Component(extendedConfig)(target);
    };
}

export function killEvent(event?: Event): void {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
}

export function isValidId(id: any): boolean {
    return !!id !== undefined && numberRegExp.test(id) && <number>id > 0;
}

export function isDevEnv(): boolean {
    return isDevMode() && environment.title === 'development';
}

export function getErrorMessageFromServer(err) {
    if (err.errors) {
        let result = '';
        const e = err.errors;
        for (const key in e) {
            if (e.hasOwnProperty(key)) {
                const element = e[key];
                element.forEach(msg => {
                    result += msg + '\r\n';
                });
            }
        }
        return result;
    }
    return '';
}
