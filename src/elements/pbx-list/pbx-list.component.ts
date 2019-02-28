import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

import { SwipeAnimation } from '@shared/swipe-animation';
import {
  BaseItemModel,
  ButtonItem,
  FilterItem,
  PageInfoModel,
  TableInfoExModel,
} from '@models/base.model';
import { HeaderComponent } from '@elements/pbx-header/pbx-header.component';
import { TableComponent } from '@elements/pbx-table/pbx-table.component';
import { dateToServerFormat } from '@shared/shared.functions';
import { LocalStorageServices } from '@services/local-storage.services';
import { MessageServices } from '@services/message.services';
import { SessionsModel } from '@models/settings.models';
import { RingGroupService } from '@services/ring-group.service';
import { DeleteEvent } from '@models/delete-event.model';
import {CallQueueService} from '@services/call-queue.service';


export const pageNum: string = 'pbx_page_num';

@Component({
  selector: 'pbx-list',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [SwipeAnimation('y', '200ms')]
})
export class ListComponent implements OnInit {
  @Input() name: string;
  @Input() itemName: string;
  @Input() itemsName: string;
  @Input() key: string;
  @Input() createKey: string = 'create';
  @Input() pageInfo: PageInfoModel;
  @Input() table: any;
  @Input() tableInfo: TableInfoExModel;
  @Input() service: any;
  @Input() buttonTitle: string;
  @Input() loading: boolean;
  @Input()
  set filters(value) {
    this._filters = value;
    if (this._filters && this._filters.length > 0) {
      this.currentFilter = {
        type: this._filters[0].id
      };
    }
  }
  _filters: FilterItem[];
  @Input() editable: boolean = true;
  @Input() deletable: boolean = true;
  @Input() buttons: ButtonItem[] = [];
  @Input() multiple: boolean;
  @Input() selected: any[];
  @Input() showEmptyInfo: boolean = true;
  @Input() hideHeader: boolean = false;
  @Input() EmptyInfo: string;
  @Input() hideArrow: boolean;
  @Input()
  set sidebar(sidebar: any) {
    this._sidebar = sidebar;
  }
  @Input() calendarDateKey: string = null;

  @Output() onCreate: EventEmitter<any> = new EventEmitter<any>();
  @Output() onEdit: EventEmitter<object> = new EventEmitter<object>();
  @Output() onSelect: EventEmitter<object> = new EventEmitter<object>();
  @Output() onLoad: EventEmitter<object> = new EventEmitter<object>();
  @Output() onDelete: EventEmitter<DeleteEvent> = new EventEmitter<DeleteEvent>();

  @ViewChild(TableComponent) items;
  @ViewChild(HeaderComponent) header: HeaderComponent;

  currentFilter: any;
  loadingEx: number = 0;
  filter = { loading: 0 };

  _sidebar: any;
  _totalItemsCount: number;

  pbxListEmptyText_1: string;
  pbxListEmptyText_2: string;

  calendarDateRange: string[] = null;
  startDate: string;
  endDate: string;

  nothingFoundText: string;
  noDataToDisplayText: string;

  // -- properties ----------------------------------------------------------

  get sidebarVisible(): boolean {
    return this._sidebar ? this._sidebar.visible : false;
  }

  get calendarVisible(): boolean {
    return !!this.calendarDateKey;
  }

  get isEmptySearch(): boolean {
    const isLoading: boolean = !!this.loading || !!this.loadingEx || !!this.filter.loading;
    const filteredWithSearch: boolean = this.activeFilter()
      && this.currentFilter
      && this.currentFilter.hasOwnProperty('search')
      && this.currentFilter.search;
    return !isLoading && filteredWithSearch && this.pageInfo.itemsCount === 0;
  }

  get isNothingFound(): boolean {
    const isLoading: boolean = !!this.loading || !!this.loadingEx || !!this.filter.loading;
    const filteredWithoutSearch: boolean = this.activeFilter()
      && this.currentFilter
      && (!this.currentFilter.hasOwnProperty('search') || !this.currentFilter.search);
    return !isLoading && filteredWithoutSearch && this.pageInfo.itemsCount === 0 && this._totalItemsCount !== 0;
  }

  get isNoData(): boolean {
    const isLoading: boolean = !!this.loading || !!this.loadingEx;
    return !isLoading && this._totalItemsCount === 0;
  }

  get isPaginationVisible(): boolean {
    const isLoading: boolean = !!this.loading || !!this.loadingEx || !!this.filter.loading;
    return !isLoading && this.pageInfo.itemsCount > 10;
  }

  constructor(private router: Router,
    public translate: TranslateService,
    private storage: LocalStorageServices,
    private messages: MessageServices) {
  }

  ngOnInit() {
    if (this.buttons.length === 0 && !this.calendarVisible) {
      this.buttons.push({
        id: 0,
        title: this.buttonTitle ? this.buttonTitle : 'Create ' + (this.itemName ? this.itemName : this.name),
        type: 'success',
        visible: true,
        inactive: false,
        buttonClass: '',
        icon: false
      });
    }

    this.nothingFoundText = this.translate.instant('Nothing found');
    this.noDataToDisplayText = this.translate.instant('No data to display');

    const pageData = this.storage.readItem(pageNum);
    if (pageData) {
      if (pageData.tableName === this.name) {
        this.pageInfo.page = pageData.pageNum;
      } else {
        this.storage.clearItem(pageNum);
      }
    }
    this.getItems();

    this.pbxListEmptyText_1 = '';
    this.pbxListEmptyText_2 = '';
    const itemName: string = this.itemsName ? this.itemsName : this.name;
    const text: string = `You do not have any ${itemName}`;
    this.pbxListEmptyText_1 = this.translate.instant(text);
    this.pbxListEmptyText_2 = this.translate.instant('Click on the button to create');

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.pbxListEmptyText_1 = this.translate.instant(this.pbxListEmptyText_1);
      this.pbxListEmptyText_2 = this.translate.instant(this.pbxListEmptyText_2);
      this.nothingFoundText = this.translate.instant('Nothing found');
      this.noDataToDisplayText = this.translate.instant('No data to display');
    });
  }

  // -- event handlers ------------------------------------------------------

  create($event) {
    if (this.onCreate.observers.length > 0) {
      this.onCreate.emit($event);
    } else {
      this.router.navigate(['cabinet', this.key, this.createKey]);
    }
  }

  edit(item: BaseItemModel) {
    if (this.onEdit.observers.length > 0) {
      this.onEdit.emit(item);
    }
    else {
      this.savePageInfoToSession();
      this.router.navigate(['cabinet', this.key, `${item.id}`]);
    }
  }

  select(item: BaseItemModel) {
    if (this.onSelect.observers.length > 0) {
      this.onSelect.emit(item);
    }
  }

  delete(item: BaseItemModel) {
    item.loading ++;
    this.service.deleteById(item.id, false)
      .then((response: any) => {
        this.getItems(item);
        this.onDelete.emit({ item: item, response: response });
      })
      .catch(() => { })
      .then(() => item.loading--);
  }

  sort() {
    this.getItems();
  }

  onLimitSelect(): void {
    this.pageInfo.page = 1;
    this.getItems();
  }

  onPageChange(pageNumber: number): void {
    this.pageInfo.page = pageNumber;
    this.storage.writeItem(pageNum, { tableName: this.name, pageNum: pageNumber });
    this.getItems();
  }

  dateChanged(range: string[]): void {
    this.calendarDateRange = range;
    this.getItems();
  }

  onClear($event) {
    this.calendarDateRange = null;
    this.getItems();
  }

  // -- filtering -----------------------------------------------------------

  reloadFilter(filter) {
    this.currentFilter = filter;
    this.getItems(this.filter);
  }

  updateFilter(filter) {
    this.currentFilter = filter;
  }

  activeFilter() {
    let result = 0;
    if (this.currentFilter) {
      Object.keys(this.currentFilter).forEach(key => {
        if (this.currentFilter[key]) result++;
      });
    }
    if (this._filters) {
      this._filters.forEach(filter => {
        if (filter && filter.options) {
          filter.options.forEach(option => (option.count > 0) && result++);
        }
      });
    }
    return result > 0;
  }

  // -- data methods --------------------------------------------------------

  getItems(item = null) {
      /*item ? item.loading ++ :*/ this.loadingEx++;
    const limit = this.pageInfo.limit;
    if (this.currentFilter && this.currentFilter.type === 1) {
      if (this.header.inputs.first.value.id === 'company') {
        this.currentFilter.type = 'company';
      } else {
        this.currentFilter.type = 'blacklist';
      }
    }

    if (this.key === 'address-book') {
      this.loadingEx++;
      this.getAddressBookTotalItems()
        .then(() => { })
        .catch(() => { })
        .then(() => this.loadingEx--);
    }

    if (this.calendarVisible && this.calendarDateRange) {
      if (!this.currentFilter) this.currentFilter = {};
      this.currentFilter['startDate'] = dateToServerFormat(this.calendarDateRange[0]);
      this.currentFilter['endDate'] = dateToServerFormat(this.calendarDateRange[1]);
    }
    if (this.calendarDateRange === null) {
      if (this.currentFilter && this.currentFilter['startDate']) {
        delete this.currentFilter['startDate'];
      }
      if (this.currentFilter && this.currentFilter['endDate']) {
        delete this.currentFilter['endDate'];
      }
    }

    this.service.getItems(this.pageInfo, this.currentFilter, this.tableInfo ? this.tableInfo.sort : null)
      .then(response => {
        this.updateItemsTranslations(response);
        this.pageInfo = response;
        this.pageInfo.limit = limit;

        this.updateTotalItems();
        if (this.header) this.header.load();

        this.onLoad.emit(this.pageInfo);
      })
      .catch(() => { })
      .then(() => /*item ? item.loading-- :*/ this.loadingEx--);
  }

  getAddressBookTotalItems(): Promise<any> {
    this._totalItemsCount = 0;
    const _this = this;
    return Promise.all([
      this.service.getItems(this.pageInfo, { type: 'company' }, this.tableInfo ? this.tableInfo.sort : null)
        .then(response => { _this._totalItemsCount += response.itemsCount; }),
      this.service.getItems(this.pageInfo, { type: 'blacklist' }, this.tableInfo ? this.tableInfo.sort : null)
        .then(response => { _this._totalItemsCount += response.itemsCount; })
    ]);
  }

  savePageInfoToSession(): void {
    if (this.key) {
      sessionStorage.setItem(`${this.key}_page`, this.pageInfo.page.toString());
      sessionStorage.setItem(`${this.key}_size`, this.pageInfo.limit.toString());
    }
  }

  updateTotalItems(): void {
    if ((!this.currentFilter || Object.keys(this.currentFilter).length === 0) && this.key !== 'address-book') {
      this._totalItemsCount = this.pageInfo.itemsCount;
    }
  }

  updateItemsTranslations(data: any): void {
    if (data instanceof SessionsModel) {
      data.locale = this.translate.currentLang;
    }
  }

  get listDataEmpty(): boolean {
    let cnt = 0;
    if (this._filters) {
      this._filters.forEach(element => {
        if (element.options) {
          element.options.forEach(opt => {
            if (opt) {
              cnt += Number(opt.count) || 0;
            }
          });
        }
      });
    }
    return (this.pageInfo.itemsCount + cnt) === 0;
  }
}
