import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';

import {DepartmentServices} from '../../services/department.services';
import {FadeAnimation} from '../../shared/fade-animation';


@Component({
  selector: 'pbx-department',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [FadeAnimation('300ms')]
})

export class DepartmentsComponent implements OnInit {
  sidebarEdit = false;
  departmentsList = [];
  sipOuters = [];
  tableInfo = {
    titles: ['Department', 'Employees', 'Employees with Ext numbers', 'Comment'],
    keys: ['name', 'sip.phoneNumber', 'strategyName', 'timeout']
  };

  departmentForm: FormGroup = new FormGroup({
    'department': new FormControl(null),
    'phone': new FormControl(null),
    'comment': new FormControl(null)
  });

  @ViewChild('addPhonesContainer', {read: ViewContainerRef}) _addPhonesContainer;
  @ViewChild('addPhoneTemplate') _addPhoneTemplate;

  constructor(private _service: DepartmentServices) {
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

  edit(): void {
    this.sidebarEdit = true;
  }

  close(): void {

  }

  cancel(): void {
    this.sidebarEdit = false;
  }

  save(): void {
    this._service.saveDepartment({}).then(res => {
      console.log(res);
    }).catch(err => {
      console.error(err);
    });
  }

  delete(): void {
    this._service.deleteDepartment(2).then(res => {
      console.log(res);
    }).catch(err => {
      console.error(err);
    });
  }


  addPhone() {
    this._addPhonesContainer.createEmbeddedView(this._addPhoneTemplate);
  }

  ngOnInit(): void {
    this.getDepartments();
    this.getSipOuters();
  }
}
