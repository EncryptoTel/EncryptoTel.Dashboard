import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {SwipeAnimation} from '../../shared/swipe-animation';
import {
    BaseItemModel,
    ButtonItem,
    FilterItem,
    PageInfoModel,
    TableInfoExModel,
    TableInfoItem
} from '../../models/base.model';
import {HeaderComponent} from '../pbx-header/pbx-header.component';
import {Router} from '@angular/router';
import {TableComponent} from '../pbx-table/pbx-table.component';
import {LangChangeEvent, TranslateService} from '@ngx-translate/core';
import {getDateRange, dateToServerFormat} from '@shared/shared.functions';

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
    @Output() onDelete: EventEmitter<object> = new EventEmitter<object>();

    @ViewChild(TableComponent) items;
    @ViewChild(HeaderComponent) header: HeaderComponent;

    currentFilter: any;
    loadingEx: number = 0;
    filter = {loading: 0};

    _sidebar: any;
    _totalItemsCount: number;

    pbxListEmptyText_1: string;
    pbxListEmptyText_2: string;

    calendarDateRange: string[] = null;
    startDate: string;
    endDate: string;

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
        return !isLoading && filteredWithoutSearch && this.pageInfo.itemsCount === 0;
    }

    get isNoData(): boolean {
        const isLoading: boolean = !!this.loading || !!this.loadingEx;
        return this.showEmptyInfo && !isLoading && this.listDataEmpty;
    }

    get isPaginationVisible(): boolean {
        const isLoading: boolean = !!this.loading || !!this.loadingEx || !!this.filter.loading;
        return !isLoading && this.pageInfo.itemsCount > 10;
    }

    constructor(private router: Router,
                public translate: TranslateService) {
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

        this.getItems();

        this.pbxListEmptyText_1 = '';
        this.pbxListEmptyText_2 = '';
        let tmp: string;
        tmp = this.itemsName ? this.itemsName : this.name;
        this.pbxListEmptyText_1 = this.translate.instant('You do not have any ') + this.translate.instant(tmp);
        this.pbxListEmptyText_1 = this.translate.instant(this.pbxListEmptyText_1);
        this.pbxListEmptyText_2 = this.translate.instant('Click on the button to create');

        this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
                this.pbxListEmptyText_1 = this.translate.instant(this.pbxListEmptyText_1);
                this.pbxListEmptyText_2 = this.translate.instant(this.pbxListEmptyText_2);
        });
    }

    // -- event handlers ------------------------------------------------------

    create() {
        if (this.onCreate.observers.length > 0) {
            this.onCreate.emit();
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
        this.onDelete.emit(item);
        this.service.deleteById(item.id)
            .then(() => {
                this.getItems(item);
            })
            .catch(() => {})
            .then(() => item.loading --);
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
        this.getItems();
    }

    dateChanged(range: string[]): void {
        this.calendarDateRange = range;
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
                if (this.currentFilter[key]) result ++;
            });
        }
        if (this._filters) {
            this._filters.forEach(filter => {
                if (filter && filter.options) {
                    filter.options.forEach(option => (option.count > 0) && result ++);
                }
            });
        }
        return result > 0;
    }

    // -- data methods --------------------------------------------------------

    getItems(item = null) {
        item ? item.loading ++ : this.loadingEx ++;
        const limit = this.pageInfo.limit;
        if (this.currentFilter && this.currentFilter.type === 1) {
            if (this.header.inputs.first.value.id === 'company') {
                this.currentFilter.type = 'company';
            } else {
                this.currentFilter.type = 'blacklist';
            }
        }
        if (this.calendarVisible && this.calendarDateRange) {
            if (!this.currentFilter) this.currentFilter = {};
            this.currentFilter['startDate'] = dateToServerFormat(this.calendarDateRange[0]);
            this.currentFilter['endDate'] = dateToServerFormat(this.calendarDateRange[1]);
        }
        this.service.getItems(this.pageInfo, this.currentFilter, this.tableInfo ? this.tableInfo.sort : null)
            .then(response => {
                this.pageInfo = response;
                this.pageInfo.limit = limit;

                // if (this.calendarVisible) {
                //     this.calendarDateRange = getDateRange(this.pageInfo.items, this.calendarDateKey);
                // }

                this.updateTotalItems();
                if (this.header) this.header.load();

                this.onLoad.emit(this.pageInfo);
            })
            .catch(() => {})
            .then(() => item ? item.loading -- : this.loadingEx --);
    }

    savePageInfoToSession(): void {
        if (this.key) {
            sessionStorage.setItem(`${this.key}_page`, this.pageInfo.page.toString());
            sessionStorage.setItem(`${this.key}_size`, this.pageInfo.limit.toString());
        }
    }

    updateTotalItems(): void {
        let totalItemsCount: number;
        if (this.pageInfo.itemsCount === 0 && (this.currentFilter !== undefined && Object.keys(this.currentFilter).length === 0)) {
            if (this._filters !== undefined && this._filters.length > 0 && this._filters[0].options.length > 0) {
                if (this._totalItemsCount === undefined) {
                    this._totalItemsCount = 0;
                }
                totalItemsCount = Math.abs(this._totalItemsCount) + Math.abs(this._filters[0].options[0].count) + Math.abs(this._filters[0].options[1].count);
            }
            if (totalItemsCount === 0) {
                this._filters = [];
            } else {
                this.pageInfo.itemsCount = totalItemsCount;
            }
        }
        if (!this.currentFilter || Object.keys(this.currentFilter).length === 0) {
            this._totalItemsCount = this.pageInfo.itemsCount;
        }
    }

    get listDataEmpty(): boolean {
        let totalItemsCount: number;
        totalItemsCount = 0;
        if (this._filters !== undefined && this._filters.length > 0 && this._filters[0].options.length > 0) {
            if (this._filters[0].options[0].count !== undefined) {
                totalItemsCount = totalItemsCount + +this._filters[0].options[0].count;
            }
            if (this._filters[0].options[1].count !== undefined) {
                totalItemsCount = totalItemsCount + +this._filters[0].options[1].count;
            }
        }
        totalItemsCount = totalItemsCount + this._totalItemsCount;
        return !totalItemsCount || totalItemsCount === 0;
    }
}
