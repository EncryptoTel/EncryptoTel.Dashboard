import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';

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
  superOptions = [];
  tableInfo = {
    titles: ['Department', 'Employees', 'Employees with Ext numbers', 'Comment'],
    keys: ['name', 'sip.phoneNumber', 'strategyName', 'timeout']
  };

  departmentForm: FormGroup = new FormGroup({
    'name': new FormControl(null, [Validators.required, Validators.maxLength(255)]),
    'sipInner': new FormControl(null, [Validators.required]),
    'comment': new FormControl(null, [Validators.maxLength(255)])
  });

  constructor(private _service: DepartmentServices) {
  }

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

  addPhone(index: number): void {
    console.log(this.superOptions);
    if (this.selectedSips.length === this.superOptions.length) {
      const selectedSipIndex = this.superOptions[index].findIndex(el => {
        return el.id === this.selectedSips[index].id;
      });
      if (selectedSipIndex !== -1) {
        this.superOptions[index + 1] = this.superOptions[index];
        this.superOptions[index + 1].splice(selectedSipIndex, 1);
      }
      console.log(this.superOptions);
    }
  }

  selectPhone(phone, index: number): void {
    this.selectedSips[index] = phone;
    this.departmentForm.controls.sipInner.setValue(this.selectedSips);
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
      this.departmentForm.controls.sipInner.setValue([this.sipOuters[0].id]);
    }).catch(err => {
      console.error(err);
    });
  }

  ngOnInit(): void {
    this.getDepartments();
    this.getSipOuters();
  }
}
