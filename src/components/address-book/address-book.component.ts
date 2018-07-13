import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';

import {AddressBookServices} from '../../services/address-book.services';
import {ContactModel, Countries, Country, PhoneTypes, Types} from '../../models/address-book.model';
import {emailRegExp, nameRegExp} from '../../shared/vars';
import {RefsServices} from '../../services/refs.services';
import {SwipeAnimation} from '../../shared/swipe-animation';
import {FadeAnimation} from '../../shared/fade-animation';
import {PageInfoModel} from '../../models/base.model';

@Component({
  selector: 'pbx-address-book',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  providers: [PageInfoModel],
  animations: [SwipeAnimation('x', '300ms'), FadeAnimation('300ms')]
})

export class AddressBookComponent implements OnInit {
  /* addressForm: FormGroup;
  contacts = []; // : ContactModel[]
  countries: Country[];
  currentContact = null; // : ContactModel;
  currentSource = {title: 'All'};
  mode = 'create';
  loading = true;
  sidebarLoading = true;
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
  modal = {
    del: {
      visible: false,
      confirm: {type: 'error', value: 'Delete'},
      decline: {type: 'cancel', value: 'Cancel'}
    },
    save: {
      visible: false,
      confirm: {type: 'success', value: 'Save'},
      decline: {type: 'cancel', value: 'Undo'}
    },
    create: {
      visible: false,
      confirm: {type: 'success', value: 'Create'},
      decline: {type: 'cancel', value: 'Cancel'}
    }
  };
  sidebarContact;
  zerg = false;
  constructor(private fb: FormBuilder,
              private _service: AddressBookServices,
              private refs: RefsServices,
              public pageInfo: PageInfoModel
              ) {
    this.pageInfo = {page: 1, visible: true, limit: 10, itemsCount: null, pageCount: null};
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
    this.currentContact = null;
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

  editContact(contact): void {
    this.sidebarLoading = true;
    this.currentContact = contact;
    this.mode = 'edit';
    this.sidebarVisible = true;
    let item: any;
    item = null;
    this._service.getContact(contact.id).then(res => {
      item = res;
      console.log(item);
      this.mode = 'edit';
      this.sidebarVisible = true;
      this.sidebarLoading = false;
    }); // ToDo редактирование сломалось нахуй. В пизду нахуй блять!!!
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

  select(item): void {
    if (this.mode === 'view' && item.id === this.currentContact) {
      this.mode = null;
      this.currentContact = null;
      this.sidebarVisible = false;
    } else {
      this.mode = 'view';
      this.sidebarVisible = true;
      this.sidebarLoading = true;
      this._service.getContact(item.id).then(res => {
        this.currentContact = res;
        console.log(item.id);
        console.log(this.currentContact);
        this.sidebarLoading = false;
      });
    }
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
    this._service.getContacts(this.pageInfo).then(res => {
      this.pageInfo.pageCount = res.totalPages;
      this.pageInfo.itemsCount = res.totalCount;
      this.contacts = res.items;
      console.log(this.contacts);
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

  changePage(page: number): void {
    this.loading = true;
    this.pageInfo.page = page;
    this.getContacts();
  }

  selectLimit(limit: number): void {
    this.loading = true;
    this.pageInfo.page = 1;
    this.pageInfo.limit = limit;
    this.getContacts();
  }

  test(): void {
    const array = [
      {a: 0, b: 'b'},
      {a: 1, b: 'bb'},
      {a: 2, b: 'bbb'},
      {a: 4, b: 'bbbb'}
      ];
    console.log(!!array.find(item => {if (item.a === {a: 0, b: 'b'}.a) {return true; }}));
  }*/

  loading = false;
  country: Country[];
  sources = {
    option: [
      {value: 'All', id: 0},
      {value: 'My Address Book', id: 1},
      {value: 'Blacklist', id: 2}
    ],
    select: {value: 'My Address Book', id: 1}
  };
  table = {
    title: ['First Name', 'Last Name', 'Phone Number', 'E-mail', 'Company Name', 'Country'],
    key: ['firstname', 'lastname', 'phone', 'email', 'company', 'country'],
    data: []
  };
  contacts = [];
  contact;
  sipOuters;
  types = {phone: [], email: []};
  modal = {
    del: {
      visible: false,
      confirm: {type: 'error', value: 'Delete'},
      decline: {type: 'cancel', value: 'Cancel'}
    },
    block: {
      visible: false,
      confirm: {type: 'error', value: 'Block'},
      decline: {type: 'cancel', value: 'Cancel'}
    },
    err: {
      visible: false,
      confirm: {type: 'error', value: 'OK'},
      decline: {type: 'error', value: ''}
    },
    exit: {
      visible: false,
      confirm: {type: 'error', value: 'Stop'},
      decline: {type: 'success', value: 'Continue'}
    }
  };
  sidebar = {
    visible: false,
    data: null,
    loading: false,
    mode: null
  };
  unit;
  constructor(
    private _address: AddressBookServices,
    private _refs: RefsServices,
    public pageInfo: PageInfoModel
  ) {
    this.pageInfo = {page: 1, limit: 10, pageCount: null, itemsCount: null, visible: true};
  }

  clickContact(item: any): void {
    this.sidebar.loading = true;
    this.sidebar.visible = true;
    this.sidebar.mode = 'view';
    this._address.getContact(item.id).then(res => {
      this.fillSidebarData(this.contact = res);
      console.log(this.contact);
      this.sidebar.loading = false;
    }).catch(err => {
      console.error(err);
    });
  }
  closeSidebar(): void {
    this.sidebar.visible = false;
    this.sidebar.data = null;
    this.sidebar.mode = null;
  }

  private getTypes(): void {
    this._address.getTypes().then(res => {
      Object.keys(res.contactEmail).forEach(key => {
        this.types.email.push({type: key, value: res.contactEmail[key]});
      });
      Object.keys(res.contactPhone).forEach(key => {
        this.types.phone.push({type: key, value: res.contactPhone[key]});
      });
    }).catch(err => {
      console.error(err); });
  }
  private getSipOuters(): void {
    this._refs.getSipOuters().then(res => {
      this.sipOuters = res;
    }).catch(err => {
      console.error(err);
    });
  }
  private getCountries(): void {
    this.loading = true;
    this._address.getCountries().then(res => {
      this.country = res.countries;
      this.getContacts();
    }).catch(err => {
      console.error(err);
    });
  }
  private getContacts(): void {
    this.loading = true;
    this.contacts = [];
    this._address.getContacts(this.pageInfo).then(res => {
      this.contacts = res.items;
      this.pageInfo.itemsCount = res.totalCount;
      this.pageInfo.pageCount = res.totalPages;
      this.pageInfo.visible = res.totalCount > 10;
      this.fillTableData();
      this.loading = false;
      console.log(res.items);
    }).catch(err => {
      console.error(err);
    });
  }

  private fillTableData(): void {
    this.table.data = [];
    this.contacts.forEach(item => {
      this.table.data.push({
        id: item.id,
        firstname: item.firstname || '',
        lastname: item.lastname || '',
        phone: !!item.contactPhone && item.contactPhone.length > 0 ?
          item.contactPhone[0].value + (!!item.contactPhone[0].extension ? ' #' + item.contactPhone[0].extension : '') : ' ',
        email: !!item.contactEmail && item.contactEmail.length > 0 ? item.contactEmail[0].value : '',
        company: item.company || '',
        country: this.country.find(el => {
          return el.id === item.id; }).title
      });
    });
  }
  private fillSidebarData(item: any): void {
    this.sidebar.data = {
      id: item.id,
      firstname: item.firstname || '',
      lastname: item.lastname || '',
      phone: [],
      email: [],
      company: item.company || '',
      department: item.department || '',
      address: item.addres || '',
      country: this.country.find(el => {
        return el.id === item.id; }).title
    };
    item.contactPhone.forEach(el => {
      this.sidebar.data.phone.push(el.value + (el.extension ? ' #' + el.extension : ''));
    });
    item.contactEmail.forEach(el => {
      this.sidebar.data.email.push(el.value);
    });
  }


  createUnit(): void {
    this.sidebar.loading = true;
    this.sidebar.visible = true;
    this.sidebar.mode = 'create';
    this.contact = null;
    this.newUnit();
    this.sidebar.loading = false;
  }
  newUnit(): void {
    this.unit = {
      firstname: {value: '', req: true},
      lastname: {value: '', req: true},
      phone: [{
        value: {value: '', req: true},
        typeId: {value: null, req: true}
      }],
      email: [{
        value: {value: '', req: true},
        typeId: {value: null, req: true}
      }],
      company: {value: '', req: true},
      department: {value: '', req: true},
      country: {value: null, req: true},
      address: {value: '', req: true}
    };
  }
  toggleHighlightLabel(event): void {
    event.target.labels[0].classList.toggle('active');
  }
  unitAddOne(text: string): void {
    this.unit[text].push({value: {value: '', req: true}, typeId: {value: null, req: true}});
  }
  unitDeleteOne(text: string, index: number): void {
    this.unit[text].splice(index, 1);
  }

  fillContact(unit: any): object {
    const item = {
      firstname: unit.firstname.value === '' ? null : unit.firstname.value,
      lastname: unit.lastname.value === '' ? null : unit.lastname.value,
      company: unit.company.value === '' ? null : unit.company.value,
      department: unit.department.value === '' ? null : unit.department.value,
      address: unit.address.value === '' ? null : unit.address.value,
      country: unit.country.value,
      countryId: !!unit.country.value ? unit.country.value : null,
      contactPhone: [],
      contactEmail: []
    };
    unit.phone.forEach(el => {
      item.contactPhone.push({
        id: null,
        value: el.value.value,
        typeId: el.typeId.value.value,
        extension: null
      });
    });
    unit.email.forEach(el => {
      item.contactEmail.push({
        id: null,
        value: el.value.value,
        typeId: el.typeId.value.value
      });
    });
    return item;
  }
  validUnit(text: string): void {
    let flag = true;
    const name_reg = new RegExp(/^\w{1,190}$/i);
    const phone_reg = new RegExp(/^\d{8,15}$/);
    flag = (this.unit.firstname.req = name_reg.test(this.unit.firstname.value)) && flag;
    flag = (this.unit.lastname.req = this.unit.lastname.value === '' || name_reg.test(this.unit.lastname.value)) && flag;
    flag = (this.unit.company.req = this.unit.company.value === '' || name_reg.test(this.unit.company.value)) && flag;
    flag = (this.unit.department.req = this.unit.department.value === '' || name_reg.test(this.unit.department.value)) && flag;
    if (this.unit.phone.length === 1) {
      flag = (this.unit.phone[0].value.req = this.unit.phone[0].value.value === '' || phone_reg.test(this.unit.phone[0].value.value)) && flag;
    } else {
      this.unit.phone.forEach(el => {
        flag = (el.value.req = phone_reg.test(el.value.value)) && flag; });
    }
    if (this.unit.email.length === 1) {
      flag = (this.unit.email[0].value.req = this.unit.email[0].value.value === '' || emailRegExp.test(this.unit.email[0].value.value)) && flag;
    } else {
      this.unit.email.forEach(el => {
        flag = (el.value.req = emailRegExp.test(el.value.value)) && flag;
      });
    }
    if (flag) {
      switch (text) {
        case 'create': this.createContact(); break;
      }
    } else {
      this.modal.err.visible = true;
    }
  }
  createContact(): void {
    this.loading = true;
    this.sidebar.loading = true;
    this.sidebar.visible = false;
    this._address.saveContact(this.fillContact(this.unit)).then(res => {
      console.log(res);
    }).catch(err => {
      console.error(err);
    });
  }

  ngOnInit(): void {
    this.getCountries();
    this.getSipOuters();
    this.getTypes();
  }
  zerg(): void {
  }
}
