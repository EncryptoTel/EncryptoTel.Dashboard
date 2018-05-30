import {Component, OnInit, ViewChildren} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {formatNumber} from 'libphonenumber-js';
import {SidebarInfo} from '../../models/sidebar-info.model';
import {CompanyServices} from '../../services/company.services';
import {CompanyModel, CountriesModel, CountryModel} from '../../models/company.model';

@Component({
  selector: 'pbx-company',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  providers: [CompanyServices]
})

export class CompanyComponent implements OnInit {
  sidebarInfo: SidebarInfo;
  countries: CountryModel[] = [];
  companyForm: FormGroup;
  selectedCountry: CountryModel;
  loading = true;
  @ViewChildren('label') labelFields;

  constructor(private _services: CompanyServices,
              private fb: FormBuilder) {
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
    this.companyForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      vatId: ['', [Validators.required]],
      companyAddress: this.fb.array([
        this.fb.group({
          country: ['', [Validators.required]],
          postalCode: ['', [Validators.required]],
          regionName: ['', [Validators.required]],
          locationName: ['', [Validators.required]],
          street: ['', [Validators.required]],
          building: ['', [Validators.required]],
          office: ['', [Validators.required]]
        })
      ])
    });
  }

  formatPhone(event): void {
    event.target.value = formatNumber(event.target.value, 'International');
  }

  cancel(): void {
    this.companyForm.reset();
  }

  save(): void {
    console.log(this.companyForm);
    if (this.companyForm.valid) {
      this._services.save({...this.companyForm.value}).then(res => {
        console.log(res);
      }).catch(err => {
        console.error(err);
      });
    } else {
      this.companyForm.markAsTouched();
    }
  }

  selectCountry(country: CountryModel): void {
    this.selectedCountry = country;
    this.companyForm.get(['companyAddress']).get('0').get('country').setValue(country.id);
  }

  private getCountries(): void {
    this._services.getCountries().then((res: CountriesModel) => {
      this.countries = res.countries;
      this.getCompany();
    }).catch(err => {
      console.error(err);
      this.loading = false;
    });
  }

  private getCompany(): void {
    this._services.getCompany().then((res: CompanyModel) => {
      const company = {
        name: res.name,
        email: res.email,
        phone: res.phone,
        vatId: res.vatId,
        companyAddress: [{
          country: res.companyAddress[0].country.id,
          postalCode: res.companyAddress[0].postalCode,
          regionName: res.companyAddress[0].regionName,
          locationName: res.companyAddress[0].locationName,
          street: res.companyAddress[0].street,
          building: res.companyAddress[0].building,
          office: res.companyAddress[0].office,
        }]
      };
      this.companyForm.setValue(company);
      this.selectedCountry = res.companyAddress[0].country;
      this.loading = false;
    }).catch(err => {
      console.error(err);
      this.loading = false;
    });
  }

  ngOnInit(): void {
    this.getCountries();
  }
}
