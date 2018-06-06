import {Component, OnInit, ViewChildren} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {formatNumber} from 'libphonenumber-js';
import {SidebarInfo} from '../../models/sidebar-info.model';
import {CompanyServices} from '../../services/company.services';
import {CompanyModel, CountriesModel, CountryModel} from '../../models/company.model';
import {emailRegExp} from '../../shared/vars';
import {FadeAnimation} from '../../shared/fade-animation';

@Component({
  selector: 'pbx-company',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  providers: [CompanyServices],
  animations: [FadeAnimation('300ms')]
})

export class CompanyComponent implements OnInit {
  companyForm: FormGroup;
  countries: CountryModel[] = [];
  hightLightLabelSelect = false;
  loading = true;
  selectedCountry: CountryModel;
  sidebarInfo: SidebarInfo;

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

    this.companyForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern(emailRegExp)]],
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

  cancel(): void {
    this.companyForm.reset();
    this.selectedCountry = null;
    this.validate();
  }

  formatPhone(event): void {
    event.target.value = formatNumber(event.target.value, 'International');
    this.toggleHighlightLabel(event);
  }
  test() {
    console.log('work');
  }
  toggleHighlightLabel(event): void {
    event.target.labels[0].classList.toggle('active');
  }

  save(): void {
    this.validate();
    if (this.companyForm.valid) {
      this.loading = true;
      this._services.save({...this.companyForm.value}).then(() => {
        this.loading = false;
      }).catch(err => {
        console.error(err);
        this.loading = false;
      });
    } else {
      this.companyForm.markAsTouched();
    }
  }

  selectCountry(country: CountryModel): void {
    this.selectedCountry = country;
    this.companyForm.get(['companyAddress']).get('0').get('country').setValue(country.id);
  }

  private getCompany(): void {
    this._services.getCompany().then((res: CompanyModel) => {
      if (res.name && res.phone && res.phone) {
        const company = {
          name: res.name,
          email: res.email,
          phone: formatNumber(`+${res.phone}`, 'International'),
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
      }
      this.loading = false;
    }).catch(err => {
      console.error(err);
      this.loading = false;
    });
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

  private validate() {
    this.companyForm.updateValueAndValidity();
    Object.keys(this.companyForm.controls).forEach(field => {
      const control = this.companyForm.get(field);
      control.markAsTouched();
    });
    const address = this.companyForm.get(['companyAddress', '0']) as FormGroup;
    Object.keys(address.controls).forEach(field => {
      const control = address.get(field);
      control.markAsTouched();
    });
  }

  ngOnInit(): void {
    this.getCountries();
  }
}
