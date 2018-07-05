import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';

import {AddressBookServices} from '../../services/address-book.services';
import {ContactModel, Countries, Country, PhoneTypes, Types} from '../../models/address-book.model';
import {emailRegExp} from '../../shared/vars';
import {RefsServices} from "../../services/refs.services";


@Component({
  selector: 'pbx-address-book',
  templateUrl: './template.html',
  styleUrls: ['./local.sass']
})

export class AddressBookComponent implements OnInit {
  addressForm: FormGroup;
  contacts: ContactModel[] = [];
  countries: Country[];
  currentContact: ContactModel;
  currentSource = {title: 'All'};
  mode = 'create';
  loading = true;
  selectedCountry: Country;
  selectedPhoneTypes: PhoneTypes[] = [];
  sidebarVisible = false;
  sipOuters;
  sources = [
    {title: 'All'},
    {title: 'My Address Book'},
    {title: 'Company'},
    {title: '365 Office Contact'},
    {title: 'Blacklisted Numbers'}
  ];
  tableInfo = {
    titles: ['First Name', 'Last Name', 'Phone number', 'E-mail', 'Company Name', 'Country'],
    keys: ['firstname', 'lastname', 'tablePhone', 'tableEmail', 'company', 'countryName']
  };
  _phoneTypes: PhoneTypes;

  constructor(private fb: FormBuilder,
              private _service: AddressBookServices,
              private refs: RefsServices) {
  }

  addEmailField(): void {
    this.contactEmails.push(this.createEmailFormField());
  }

  addPhoneField(): void {
    this.contactPhones.push(this.createNumberFormField());
  }

  block(): void {
    for (let i = 0; i < this.sipOuters.length; i++) {
      this._service.block({blockContact: this.currentContact.id, sipOuter: this.sipOuters[i].id}).then(() => {
      }).catch(err => {
        console.error(err);
      });
    }
    this.sidebarVisible = false;
  }

  cancel(): void {
    if (this.currentContact) {
      this.mode = 'view';
    } else {
      this.sidebarVisible = false;
    }
  }

  close(): void {
    this.sidebarVisible = false;
  }

  delete(contact: ContactModel): void {
    this.sidebarVisible = false;
    this._service.delete(contact.id).then(() => {
      this.getContacts();
    }).catch(err => {
      console.error(err);
    });
  }

  delPhoneField(i: number): void {
    this.contactPhones.removeAt(i);
    this.selectedPhoneTypes.splice(i, 1);
  }

  edit(value: ContactModel): void {
    this.currentContact = value;
    this.resetForm();
    this.contactEmails.controls = [];
    this.contactPhones.controls = [];
    value.contactEmails.forEach(() => {
      this.addEmailField();
    });
    value.contactPhones.forEach(phone => {
      this.setPhoneTypeEdit(phone);
      this.addPhoneField();
    });
    this.addressForm.setValue(this.formatForEdit(value));
    if (value.countryId) {
      this.addressForm.get('countryId').setValue(value.countryId);
      const cntry = this.countries.find(country => {
        if (value.countryId === country.id) {
          return true;
        }
      });
      this.selectedCountry = cntry;
    }
    this.mode = 'edit';
    this.sidebarVisible = true;
  }

  newContact(): void {
    this.currentContact = null;
    this.sidebarVisible = true;
    this.mode = 'create';
    this.resetForm();
  }

  save(): void {
    this.addressForm.markAsTouched();
    this.validate(this.addressForm);
    if (this.addressForm.valid) {
      this.loading = true;
      if (this.mode === 'create') {
        this._service.saveContact({...this.addressForm.value}).then(() => {
          this.getContacts();
          this.resetForm();
          this.loading = false;
        }).catch(err => {
            console.error(err);
            this.loading = false;
          }
        );
      } else if (this.mode === 'edit') {
        this._service.edit(this.currentContact.id, {...this.addressForm.value}).then(() => {
          this.getContacts();
          this.resetForm();
          this.loading = false;
        }).catch(err => {
          console.error(err);
          this.loading = false;
        });
      }
    }
  }

  search(event): void {
    const keyword = event.target.value;
    this._service.search(keyword).then(res => {
      this.contacts = res.items;
      this.contacts.forEach(contact => {
        const cntry = this.countries.find(country => {
          if (contact.countryId === country.id) {
            return true;
          }
        });
        if (cntry) {
          contact.countryName = cntry.title;
        }
        contact.tablePhone = `${contact.contactPhones[0].value} #${contact.contactPhones[0].extension}`;
        contact.tableEmail = contact.contactEmails[0].value;
      });
      this.loading = false;
    }).catch(err => {
      console.error(err);
      this.loading = false;
    });
  }

  select(value): void {
    this.sidebarVisible = true;
    this.mode = 'view';
    this.currentContact = value;
  }

  selectCountry(country: Country): void {
    this.addressForm.get('countryId').setValue(country.id);
    this.selectedCountry = country;
  }

  selectPhoneType(phone, i): void {
    this.addressForm.get(['contactPhones', `${i}`, 'typeId']).setValue(phone.value);
    this.selectedPhoneTypes[i] = phone;
  }

  selectSource(source): void {
    this.currentSource = source;
  }

  get contactEmails(): FormArray {
    return this.addressForm.get('contactEmails') as FormArray;
  }

  get contactPhones(): FormArray {
    return this.addressForm.get('contactPhones') as FormArray;
  }

  get phoneTypes(): PhoneTypes[] {
    const phoneTypes = [];
    Object.keys(this._phoneTypes).forEach(key => {
      phoneTypes.push({type: key, value: this._phoneTypes[key]});
    });
    return phoneTypes;
  }

  private formatForEdit(contact): ContactModel {
    let {contactAddresses, contactEmails, contactPhones} = contact;
    contactAddresses = contactAddresses.map(address => {
      return {value: address.value, typeId: ''};
    });
    contactEmails = contactEmails.map(email => {
      return {value: email.value, typeId: ''};
    });
    contactPhones = contactPhones.map(phone => {
      return {value: `${phone.value} #${phone.extension}`, typeId: phone.typeId};
    });
    return {
      company: contact.company,
      countryId: contact.countryId,
      department: contact.department,
      firstname: contact.firstname,
      lastname: contact.lastname,
      contactAddresses: contactAddresses,
      contactEmails: contactEmails,
      contactPhones: contactPhones
    };
  }

  private buildForm(): void {
    this.addressForm = this.fb.group({
      countryId: '',
      firstname: ['', [Validators.required]],
      lastname: '',
      department: '',
      company: '',
      contactAddresses: this.fb.array([this.fb.group({
        value: ['', [Validators.required]],
        typeId: ''
      })]),
      contactPhones: this.fb.array([this.createNumberFormField()]),
      contactEmails: this.fb.array([this.createEmailFormField()])
    });
  }

  private createEmailFormField(): FormGroup {
    return this.fb.group({
      value: ['', [Validators.required, Validators.pattern(emailRegExp)]],
      typeId: ''
    });
  }

  private createNumberFormField(): FormGroup {
    return this.fb.group({
      value: ['', [Validators.required, Validators.minLength(8)]],
      typeId: ''
    });
  }

  private getContacts(): void {
    this._service.getContacts().then(res => {
      this.contacts = res.items;
      this.contacts.forEach(contact => {
        const cntry = this.countries.find(country => {
          if (contact.countryId === country.id) {
            return true;
          }
        });
        if (cntry) {
          contact.countryName = cntry.title;
        }
        // contact.tablePhone = `${contact.contactPhones[0].value} #${contact.contactPhones[0].extension}`;
        // contact.tableEmail = contact.contactEmails[0].value;
      });
      this.loading = false;
    }).catch(err => {
      console.error(err);
    });
  }

  private getCountries(): void {
    this._service.getCountries().then((res: Countries) => {
      this.countries = res.countries;
      this.getContacts();
    }).catch(err => {
      console.error(err);
    });
  }

  private getTypes(): void {
    this._service.getTypes().then((res: Types) => {
      this._phoneTypes = res.contactPhone;
    }).catch(err => {
      console.error(err);
    });
  }

  private getSipOuters(): void {
    this.refs.getSipOuters().then(res => {
      this.sipOuters = res;
    }).catch(err => {
      console.error(err);
    });
  }

  private resetForm(): void {
    this.addressForm.reset();
    this.selectedCountry = null;
    this.selectedPhoneTypes = [];
    this.contactEmails.controls = [];
    this.contactPhones.controls = [];
    this.addPhoneField();
    this.addEmailField();
  }

  private setPhoneTypeEdit(phone): void {
    this.phoneTypes.forEach(type => {
      if (type.value === phone.typeId) {
        this.selectedPhoneTypes.push(type);
      }
    });
  }

  private validate(form: FormGroup): void {
    Object.keys(form.controls).forEach(control => {
      if (form.get(control) instanceof FormArray) {
        const ctrl = form.get(control) as FormArray;
        ctrl.controls.forEach(cont => {
          const ctr = cont as FormGroup;
          ctr.markAsTouched();
          Object.keys(ctr.controls).forEach(c => {
            ctr.get(c).markAsTouched();
          });
        });
      } else {
        form.get(control).markAsTouched();
      }
    });
  }

  ngOnInit() {
    this.getCountries();
    this.getTypes();
    this.buildForm();
    this.getSipOuters();
  }
}
