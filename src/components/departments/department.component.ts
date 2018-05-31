import {Component, OnInit} from '@angular/core';

import {DepartmentServices} from '../../services/department.services';


@Component({
  selector: 'pbx-department',
  templateUrl: './template.html',
  styleUrls: ['./local.sass']
})

export class DepartmentsComponent implements OnInit {
  departmentsList = [];
  tableInfo = {
    titles: ['Department', 'Employees', 'Employees with Ext numbers', 'Comment'],
    keys: ['name', 'sip.phoneNumber', 'strategyName', 'timeout']
  };

  constructor(private _service: DepartmentServices) {}

  getDepartments(): void {
    this._service.getDepartments().then(res => {
      console.log(res);
    }).catch(err => {
      console.error(err);
    });
  }

  ngOnInit(): void {
    this.getDepartments();
  }
}
