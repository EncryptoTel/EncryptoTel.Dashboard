import {Component, OnInit} from '@angular/core';
import {PhoneNumbersServices} from '../../services/phone-numbers.services';
import {TableInfoModel} from '../../models/table-info.model';
import {SwipeAnimation} from '../../shared/swipe-animation';

@Component({
  selector: 'phone-numbers-component',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  providers: [PhoneNumbersServices],
  animations: [SwipeAnimation('x', '300ms')]
})

export class PhoneNumbersComponent implements OnInit {

  loading: boolean;

  list: any[];
  tableInfo: TableInfoModel;
  selected: any;

  requestDetails: {
    search: string,
    page: number,
    limit: number
  };

  constructor(private _services: PhoneNumbersServices) {
    this.tableInfo = {
      titles: ['Phone Number', 'Amount of phone Exts', 'Default Ext', 'Status', 'Number type'],
      keys: ['phoneNumber', 'exts', 'default_ext', 'status', 'provider']
    };
  }

  selectItem(item: any): void {
    this.selected = item;
  }

  editItem(item: any): void {
    console.log('EDIT: ', item);
  }

  deleteItem(item: any): void {
    item.loading = true;
    this._services.removePhoneNumber(item.id)
      .then(() => {
        this.selected = {};
        item.loading = false;
        this.getList();
      }).catch();
  }

  isSelected(): boolean {
    return Object.keys(this.selected).length > 0;
  }

  getList(): void {
    this.loading = true;
    this._services.getPhoneNumbersList(this.requestDetails)
      .then(res => {
        this.list = [];
        res.items.map(item => {
          item.exts = item.sipInners.length;
          item.status = item.status === 1 ? 'Enabled' : 'Disabled';
          item.provider = item.providerId === '1' ? 'Internal' : 'External';
          item.sipInners.map(inner => {
            if (inner.default) {
              item.default_ext = '#' + inner.phoneNumber;
            } else {
              item.default_ext = 'Not defined';
            }
          });
          this.list.push(item);
        });
        this.loading = false;
      }).catch();
  }

  calculateLimit(): number {
    return 14;
  }

  ngOnInit() {
    this.requestDetails = {
      search: '',
      page: 3,
      limit: this.calculateLimit()
    };
    this.selected = {};
    this.getList();
  }
}
