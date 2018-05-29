import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

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
  superOptions = [];
  departmentForm: FormGroup;

  constructor(private _service: DepartmentServices, private fb: FormBuilder) {
  }

  addPhone(i: number): void {
    const sips = this.departmentForm.get('sipInner') as FormArray;
    if (sips.controls[i].valid) {
      sips.push(this.createPhoneField());
      this.superOptions.push(Array.from(this.sipOuters));
    }
  }

  addDepartment(): void {
    this.mode = 'create';
    this.sidebarVisible = true;
    this.sidebarEdit = true;
  }

  cancel(): void {
    if (this.mode === 'create') {
      this.sidebarVisible = false;
    } else {
      this.sidebarEdit = false;
    }
  }

  close(): void {
    this.sidebarVisible = false;
  }


  delete(id: number): void {
    console.log(id);
    this._service.deleteDepartment(id).then(res => {
      console.log(res);
    }).catch(err => {
      console.error(err);
    });
  }

  edit(id: number): void {
    console.log(id);
    this.mode = 'edit';
    this.sidebarEdit = true;
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

  selectPhone(phone, index: number): void {
    this.selectedSips[index] = phone;
    const sips = this.departmentForm.get('sipInner') as FormArray;
    sips.controls[index].setValue(phone.id);

  }

  private deleteUsageSips(index: number) {
    for (let i = 0; i < this.selectedSips.length; i++) {
      if (index !== i) {
          this.superOptions[i]
      }
    }
  }

  private createPhoneField(): FormControl {
    return this.fb.control(null, Validators.required);
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
      this.superOptions.push(Array.from(res.items));
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
