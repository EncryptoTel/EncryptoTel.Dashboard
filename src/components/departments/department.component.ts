import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

import {DepartmentServices} from '../../services/department.services';
import {FadeAnimation} from '../../shared/fade-animation';
import {SipOuter} from '../../models/departments.model';


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

  constructor(private _service: DepartmentServices, private fb: FormBuilder) {
  }

  addPhone(i: number): void {
    const sips = this.departmentForm.get('sipInner') as FormArray;
    console.log(this.sipOuters);
    console.log(this.selectedSips);
    if (sips.valid && (this.selectedSips.length < this.sipOuters.length)) {
      sips.push(this.createPhoneField());
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

  getSelectNumbers(): SipOuter[] {
    const array = [];
    this.sipOuters.forEach(sip => {
      if (!sip.blocked) {
        array.push(sip);
      }
    });
    return array;
  }

  edit(id: number): void {
    console.log(id);
    this.mode = 'edit';
    this.sidebarEdit = true;
  }

  save(): void {
    if (this.departmentForm.valid) {
      this._service.saveDepartment({...this.departmentForm.value}).then(res => {
        console.log(res);
      }).catch(err => {
        console.error(err);
      });
    }
  }

  selectPhone(phone: SipOuter, index: number): void {
    this.selectedSips[index] = phone;
    const sips = this.departmentForm.get('sipInner') as FormArray;
    sips.controls[index].setValue(phone.id);
    this.sipOuters.forEach(sip => {
      sip.blocked = false;
    });
    this.selectedSips.forEach(sip => {
      sip.blocked = true;
    });
  }

  private addBlockField(array: any[]): void {
    for (let i = 0; i < array.length; i++) {
      array[i].blocked = false;
    }
  }

  private createPhoneField(): FormControl {
    return this.fb.control('', Validators.required);
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
      this.sipOuters = res.items;
      this.addBlockField(this.sipOuters);
    }).catch(err => {
      console.error(err);
    });
  }

  ngOnInit(): void {
    this.getDepartments();
    this.getSipOuters();
    this.departmentForm = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(255)]],
      comment: [''],
      sipInner: this.fb.array([this.createPhoneField()])
    });
  }
}
