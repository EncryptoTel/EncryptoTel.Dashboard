import {Component, Input, OnInit, ViewChildren} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'rights-add-extension-component',
  templateUrl: './template.html',
  styleUrls: ['./../local.sass']
})

export class RightsAddExtensionComponent implements OnInit {
  @Input() form: any;
  loading: number;
  role = {
    option: [{id: 1, title: 'role 1'}, {id: 2, title: 'role 2'}, {id: 3, title: 'role 3'}],
    selected: null,
    isOpen: false
  };
  @ViewChildren('label') labelFields;

  constructor() {}
  toggleHighlightLabel(event): void {
    event.target.labels[0].classList.toggle('active');
  }
  changeCheckbox(text: string): void {
    this.form.get(text).setValue(!this.form.get(text).value);
  }
  selectRole(role): void {
    this.role.selected = role;
    this.form.get('rightsRole').setValue(role.id);
  }
  findById(id: number, array: any): object {
    for (let i = 0; i < array.length; i++) {
      if (array[i]['id'] === id) {
        return array[i]; }}
    return null;
  }

  ngOnInit(): void {
    this.loading = 0;
    this.role.selected = this.findById(this.form.get('rightsRole').value, this.role.option);
  }
}
