import {FormGroup} from '@angular/forms';
import {plainToClass} from 'class-transformer';
import {CountryModel} from '../models/country.model';
import {CurrencyModel} from '../models/currency.model';
import {ElementRef} from '@angular/core';

export function getCountryById(id: number): CountryModel {
  const list: CountryModel[] = plainToClass(CountryModel, JSON.parse(localStorage.getItem('pbx_countries')));
  return list ? list.find(country => country.id === id) : null;
}

export function getCurrencyById(id: number): CurrencyModel {
  const list: CurrencyModel[] = plainToClass(CurrencyModel, JSON.parse(localStorage.getItem('pbx_currencies')));
  return list ? list.find(currency => currency.id === id) : null;
}

export function dateComparison(date0: Date, date1: Date) {
  return (date0.getMonth() === date1.getMonth()) && (date0.getDate() === date1.getDate());
}

export function validateForm(form: FormGroup): void {
  form.updateValueAndValidity();
  Object.keys(form.controls).forEach(field => {
    const control = form.get(field);
    control.markAsTouched();
  });
}

export function calculateHeight(table: ElementRef, row: ElementRef, row2?: ElementRef): number {
  const height = row2 ?
    table.nativeElement.clientHeight - (row.nativeElement.clientHeight + +getComputedStyle(row.nativeElement).marginBottom.split('px')[0] +
    (row2.nativeElement.clientHeight + +getComputedStyle(row2.nativeElement).marginTop.split('px')[0]))
    : table.nativeElement.clientHeight - (row.nativeElement.clientHeight + +getComputedStyle(row.nativeElement).marginBottom.split('px')[0]) * 2;
  return Math.round((height - height % 41) / 41) - 1;
}

export function compareValues(key: string, order: string = 'asc') {
  return (a, b) => {
      const varA = evalByKey(key, a);
      const varB = evalByKey(key, b);

      let comparison = 0;
      if (varA > varB) {
          comparison = 1;
      } 
      else if (varA < varB) {
          comparison = -1;
      }
      
      return (order == 'desc') ? (comparison * -1) : comparison;
  };
}

export function evalByKey(key: string, variable: any): any {
  var value = 0;
  if(variable.hasOwnProperty(key)) {
      value = (typeof variable[key] === 'string') ? variable[key].toUpperCase() : variable[key];
  }
  return value;
}
