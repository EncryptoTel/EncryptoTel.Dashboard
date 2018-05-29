import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';

import {DepartmentServices} from '../../services/department.services';
import {FadeAnimation} from '../../shared/fade-animation';
import {Sip, SipOuter} from '../../models/departments.model';


@Component({
  selector: 'pbx-department',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [FadeAnimation('300ms')]
})

export class DepartmentsComponent implements OnInit {
  sidebarEdit = false;
  sidebarVisible = false;
  mode = 'create';
  departmentsList = [];
  sipOuters: SipOuter[] = [];
  selectedSips: SipOuter[] = [];
  tableInfo = {
    titles: ['Department', 'Employees', 'Employees with Ext numbers', 'Comment'],
    keys: ['name', 'sip.phoneNumber', 'strategyName', 'timeout']
  };

  departmentForm: FormGroup;

  constructor(private _service: DepartmentServices,
              private fb: FormBuilder) {}

  edit(id: number): void {
    console.log(id);
    this.mode = 'edit';
    this.sidebarEdit = true;
  }

  close(): void {
    this.sidebarVisible = false;
  }

  cancel(): void {
    if (this.mode === 'create') {
      this.sidebarVisible = false;
    } else {
      this.sidebarEdit = false;
    }
  }

  save(): void {
    console.log({...this.departmentForm.value});
    if (this.departmentForm.valid) {
      this._service.saveDepartment({...this.departmentForm.value}).then(res => {
        console.log(res);
      }).catch(err => {
        console.error(err);
      });
    }
  }

  delete(id: number): void {
    console.log(id);
    this._service.deleteDepartment(id).then(res => {
      console.log(res);
    }).catch(err => {
      console.error(err);
    });
  }

  addDepartment(): void {
    this.mode = 'create';
    this.sidebarVisible = true;
    this.sidebarEdit = true;
  }

  createPhoneField() {
    return this.fb.control({
      sip: [null]
    });
  }

  addPhone(): void {
    const sips = this.departmentForm.get('sipInner') as FormArray;
    console.log(sips);
    sips.push(this.createPhoneField());
  }

  selectPhone(phone, index: number): void {
    this.selectedSips[index] = phone;
    const sips = this.departmentForm.get('sipInner') as FormArray;
    sips.controls[index].setValue(phone.id);
  }

  private getDepartments(): void {
    this._service.getDepartments().then(res => {
      console.log(res);
    }).catch(err => {
      console.error(err);
    });
  }

  private getSipOuters(): void {
    this._service.getSipOuters().then(res => {
      console.log(res);
      this.sipOuters = res.items;
    }).catch(err => {
      console.error(err);
    });
  }

  ngOnInit(): void {
    this.getDepartments();
    this.getSipOuters();
    this.departmentForm = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(255)]],
      comment: [null],
      sipInner: this.fb.array([this.createPhoneField()])
    });
  }
}
