import {Component} from '@angular/core';
import {SidebarInfo} from '../../models/sidebar-info.model';
import {FormGroup} from '@angular/forms';
import {CompanyServices} from '../../services/company.services';

@Component({
  selector: 'pbx-company',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  providers: [CompanyServices]
})

export class CompanyComponent {
  sidebarInfo: SidebarInfo;
  company: FormGroup;
  constructor(private _services: CompanyServices) {
    this.sidebarInfo = {
      title: 'Information',
      description: [
        {title: 'External numbers', value: 4},
        {title: 'Internal numbers', value: 5},
        {title: 'Unassigned Ext', value: 7},
        {title: 'Storage space', value: '1500 Mb'},
        {title: 'Available space', value: '430 Mb'},
      ]
    };
    this._services.getTypes();
  }
}
