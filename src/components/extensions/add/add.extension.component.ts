import {Component, OnInit, ViewChildren} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {emailRegExp} from '../../../shared/vars';

@Component({
  selector: 'add-extension-component',
  templateUrl: './template.html',
  styleUrls: ['./local.sass']
})

export class AddExtensionsComponent implements OnInit {
  loading: boolean;
  tab = {
    items: ['General', 'Voicemail', 'Forwarding Rules', 'Options', 'Rights', 'Privacy and Security'],
    select: 'General'
  };
  phone = {
    option: [{title: 'phone 1'}, {title: 'phone 2'}, {title: 'phone 3'}, {title: 'phone 4'}],
    selected: null,
    isOpen: false
  };
  ext_phone = {
    option: [{title: 'phone 1'}, {title: 'phone 2'}, {title: 'phone 3'}, {title: 'phone 4'}],
    selected: null,
    isOpen: false
  };
  formGeneral: FormGroup;

  @ViewChildren('label') labelFields;

  constructor(
    private formBuilder: FormBuilder
  ) {
    this.formGeneral = this.formBuilder.group( {
      phone: ['', [Validators.required]],
      extension: ['', [Validators.required]],
      default: false,
      encrypted: false,
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.pattern(emailRegExp)]],
      mobile: [''],
      external: [''],
      sendAdmin: false,
      sendUser: false,
      sendMobile: false
    });
  }

  toggleHighlightLabel(event): void {
    event.target.labels[0].classList.toggle('active');
  }
  selectTab(text: string): void {
    this.loading = true;
    this.tab.select = text;
    // etc
    this.loading = false;
  }
  changeCheckbox(text: string): void {
    this.formGeneral.get(text).setValue(!this.formGeneral.get(text).value);
  }

  selectPhone(phone): void {
    this.phone.selected = phone;
    this.formGeneral.get('phone').setValue(phone.title);
  }

  selectExternal(phone): void {
    this.ext_phone.selected = phone;
    this.formGeneral.get('external').setValue(phone.title);
  }

  sendPassword(): void {
    // etc.
  }

  ngOnInit(): void {
    this.loading = true;
    // etc.
    this.loading = false;
  }

  log(item): void {
    console.log(item);
  }
}
