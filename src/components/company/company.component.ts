import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';

import {parseNumber, formatNumber, AsYouType} from 'libphonenumber-js';
import {SidebarInfo} from '../../models/sidebar-info.model';
import {CompanyServices} from '../../services/company.services';
import {CountriesModel, CountryModel} from '../../models/company.model';
import {emailRegExp} from '../../shared/vars';

@Component({
  selector: 'pbx-company',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  providers: [CompanyServices]
})

export class CompanyComponent implements OnInit {
  sidebarInfo: SidebarInfo;
  countries: CountryModel[] = [];
  companyForm: FormGroup = new FormGroup({
    'organization': new FormControl(null, [Validators.maxLength(255)]),
    'country': new FormControl({id: 2, code: 'AF', title: 'Afghanistan'}),
    'city': new FormControl(null, [Validators.maxLength(255)]),
    'street': new FormControl(null, [Validators.maxLength(255)]),
    'house': new FormControl(null, [Validators.maxLength(255)]),
    'office': new FormControl(null, [Validators.maxLength(255)]),
    'postal': new FormControl(null, [Validators.maxLength(255)]),
    'email': new FormControl(null, [Validators.pattern(emailRegExp), Validators.maxLength(255)]),
    'phone': new FormControl(null, [Validators.maxLength(255)]),
    'VAT': new FormControl(null, [Validators.maxLength(255)])
  });
  loading = true;

  constructor(private _services: CompanyServices) {
    this.sidebarInfo = {
      title: 'Information',
      description: [
        {title: 'External numbers', value: 4},
        {title: 'Internal numbers', value: 5},
        {title: 'Unassigned Ext', value: 7},
        {title: 'Storage space', value: '1500 Mb'},
        {title: 'Available space', value: '430 Mb'},
      ]
    };
    this._services.getTypes();
  }

  selectCountry(country: CountryModel): void {
    this.companyForm.controls.country.setValue(country);
  }

  save(): void {
    this._services.save({}).then(res => {
      console.log(res);
    }).catch(err => {
      console.error(err);
    });
  }

  cancel(): void {
    this.companyForm.reset();
  }

  formatPhone(event): void {
    event.target.value = formatNumber(event.target.value, 'International');
  }

  private getCountries(): void {
    this._services.getCountries().then((res: CountriesModel) => {
      this.countries = res.countries;
      this.loading = false;
    }).catch(err => {
      console.error(err);
    });
  }

  ngOnInit(): void {
    this.getCountries();
  }
}

// parseNumber('8 (800) 555 35 35', 'RU')
// // { country: 'RU', phone: '8005553535' }
//
// formatNumber({ country: 'US', phone: '2133734253' }, 'International')
// formatNumber('+12133734253', 'International')
// // '+1 213 373 4253'
//
// new AsYouType().input('+12133734')
// // '+1 213 373 4'
// new AsYouType('US').input('2133734')
// // '(213) 373-4'
