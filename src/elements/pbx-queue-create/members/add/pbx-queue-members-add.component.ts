import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

import {FadeAnimation} from '@shared/fade-animation';
import {FilterItem} from '@models/base.model';
import {HeaderComponent} from '@elements/pbx-header/pbx-header.component';


@Component({
    selector: 'pbx-queue-members-add',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})
export class QueueMembersAddComponent implements OnInit {
    loading: number = 0;

    id: number = 0;
    members: any[] = [];
    departments: any[] = [];

    filters: FilterItem[] = [];
    currentFilter: { department: any, search: string } = { department: null, search: '' };

    table: any = {
        titles: ['#Ext', 'Phone number', 'First Name', 'Last Name', 'Email', 'Status'],
        keys: ['phoneNumber', 'sipOuter.phoneNumber', 'firstName', 'lastName', 'email', 'statusName']
    };

    departmentPlaceholderText: string;
    searchPlaceholderText: string;
    nothingFoundText: string;
    noDataToDisplayText: string;

    @Input() service: any;

    @ViewChild(HeaderComponent) header: HeaderComponent;

    // -- properties ----------------------------------------------------------

    get nothingFound(): boolean {
        return this.members.length === 0;
    }

    get emptyResultMessage(): string | null {
        if (this.nothingFound) {
            const message: string =
                (this.currentFilter.search && this.currentFilter.search.length > 0)
                || this.currentFilter.department === 'all'
                    ? this.nothingFoundText
                    : this.noDataToDisplayText;
            return message;
        }
        return null;
    }

    // -- component lifecycle methods -----------------------------------------

    constructor(
        public translate: TranslateService
    ) {
        this.table = {
            titles: [
                this.translate.instant('#Ext'),
                this.translate.instant('Phone number'),
                this.translate.instant('First Name'),
                this.translate.instant('Last Name'),
                this.translate.instant('E-mail'),
                this.translate.instant('Status')
            ],
            keys: ['phoneNumber', 'sipOuter.phoneNumber', 'firstName', 'lastName', 'email', 'statusName']
        };

        this.departmentPlaceholderText = this.translate.instant('[choose one]');
        this.searchPlaceholderText = this.translate.instant('Search by Name or Phone');
        this.nothingFoundText = this.translate.instant('Nothing found');
        this.noDataToDisplayText = this.translate.instant('No data to display');
    }

    ngOnInit() {
        if (this.service.item.sipId) {
            this.getMembers(this.service.item.sipId);
            this.getDepartments(this.service.item.sipId);
        }
    }

    initFilters(): void {
        const departmentsSelect = FilterItem.createSelectItem(
            1,
            'department',
            'Department',
            this.departments,
            'name',
            this.departmentPlaceholderText,
            true,
            'count');
        this.filters.push(departmentsSelect);
        this.filters.push(new FilterItem(
            2, 'search', 'Search', null, null, this.searchPlaceholderText
        ));
        this.header.selectedFilter[0] = this.departments[0];
    }

    // -- event handlers ------------------------------------------------------

    selectMember(member): void {
        this.service.addMember(member);
    }

    // deleteMember(member): void {
    //     this.service.deleteMember(member);
    // }

    reloadFilter(filter: any): void {
        this.currentFilter.department = filter.hasOwnProperty('department')
            ? filter.department
            : 0;
        this.currentFilter.search = filter.hasOwnProperty('search')
            ? filter.search
            : '';
        this.getMembers(this.id);
    }

    clearSearch() {
        this.currentFilter.search = '';
        this.getMembers(this.id);
    }

    // -- component methods ---------------------------------------------------

    private addPhoneNumberField(): void {
        for (let i = 0; i < this.members.length; i ++) {
            this.members[i].sipOuterPhone = this.service.userView.phoneNumber.code;
        }
    }

    // -- data processing methods ---------------------------------------------

    private getMembers(id: number): void {
        this.id = id;
        this.loading ++;
        this.service.getMembers(id, this.currentFilter.search, this.currentFilter.department)
            .then((response) => {
                this.members = response.items;
                this.members.forEach(item => {
                    if (item.sipOuter.providerId !== 1) {
                        item.sipOuter.phoneNumber = '+' + item.sipOuter.phoneNumber;
                    }
                });
                this.addPhoneNumberField();
            })
            .catch(() => {})
            .then(() => {
                this.loading --;
            });
    }

    private getDepartments(sipId: number) {
        this.loading ++;
        this.service.getDepartments(sipId)
            .then((response) => {
                this.loading ++;
                this.service.getMembers(sipId, this.currentFilter.search, this.currentFilter.department)
                    .then((members) => {
                        let totalCount: number = 0;
                        response.items.forEach(item => {
                            totalCount = totalCount + parseInt(item.employees);
                            item.name = item.name + ' (' + item.employees + ')';
                        });

                        const all = { 'name': this.translate.instant('All members'), 'id': 'all', 'count': members.items.length };
                        this.departments = [ all, ...response.items ];
                        this.currentFilter.department = this.departments[0];
                        this.initFilters();
                    })
                    .catch(() => {})
                    .then(() => this.loading --);
            })
            .catch(() => {})
            .then(() => this.loading --);
    }
}
