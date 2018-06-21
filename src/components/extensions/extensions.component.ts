import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ExtensionsServices} from '../../services/extensions.services';
import {calculateHeight} from '../../shared/shared.functions';

@Component({
  selector: 'extensions-component',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  providers: [ExtensionsServices]
})

export class ExtensionsComponent implements OnInit {

  loading: boolean;

  requestDetails: {
    departmentId: number,
    search: string,
    page: number,
    limit: number
  };

  pagination: {
    page: number;
    total: number;
  };

  selected;

  @ViewChild('row') row: ElementRef;
  @ViewChild('table') table: ElementRef;

  constructor(private _services: ExtensionsServices) {}

  getList(): void {
    this.loading = true;
    this._services.getExtensionsList(this.requestDetails)
      .then(res => {
        console.log(res);
      }).catch();
  }

  ngOnInit() {
    setTimeout(() => {
      this.requestDetails = {
        departmentId: null,
        search: '',
        page: 1,
        limit: calculateHeight(this.table, this.row)
      };
      this.getList();
    });
    this.pagination.page = 1;
    this.selected = {};
  }
}
