import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {FadeAnimation} from '../../../../shared/fade-animation';
import {RefsServices} from '../../../../services/refs.services';
import {isDevEnv} from '../../../../shared/shared.functions';
import {ListComponent} from '@elements/pbx-list/pbx-list.component';
import {SelectComponent} from '@elements/pbx-select/pbx-select.component';
import {TranslateService} from '@ngx-translate/core';


@Component({
    selector: 'pbx-queue-members-add',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})
export class QueueMembersAddComponent implements OnInit {

    @Input() service;

    loading = 0;
    members = [];
    departments: any[] = [];
    selectedDepartment;
    table = {
        titles: ['#Ext', 'Phone number', 'First Name', 'Last Name', 'Email', 'Status'],
        keys: ['phoneNumber', 'sipOuter.phoneNumber', 'firstName', 'lastName', 'email', 'statusName']
    };
    searchTimeout;
    searchStr = '';
    id = 0;
    searchIcon: boolean = false;
    nothingFound: boolean = false;
    searchPlaceholder: any;
    departmentName: any;
    searchName: any;
    nothingFoundText: string;

    @ViewChild('searchString') searchString: ElementRef;
    @ViewChild(SelectComponent) pbxSelect: SelectComponent;

    // -- component lifecycle methods -----------------------------------------

    constructor(private refs: RefsServices, public translate: TranslateService) {
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
        this.nothingFoundText = this.translate.instant('Nothing found');
        this.searchPlaceholder = this.translate.instant('Search by Name or Phone');
        this.departmentName = this.translate.instant('Department');
        this.searchName = this.translate.instant('Search');
    }

    ngOnInit() {
        if (this.service.item.sipId) {
            this.getMembers(this.service.item.sipId);
            this.getDepartments(this.service.item.sipId);
        }
    }

    // -- event handlers ------------------------------------------------------

    selectMember(member): void {
        this.service.addMember(member);
    }

    deleteMember(member): void {
        // this.service.deleteMember(member);
    }

    departmentChanged(item) {
        this.selectedDepartment = item;
        this.getMembers(this.id);
    }

    search(event) {
        if (event.target.value.length > 0) {
            this.searchIcon = true;
        } else {
            this.searchIcon = false;
        }
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        this.searchStr = event.target.value;
        this.searchTimeout = setTimeout(() => {
            this.getMembers(this.id);
        }, 500);

    }

    clearSearch() {
        this.searchString.nativeElement.value = '';
        this.searchIcon = false;
        this.searchStr = '';
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
        this.service.getMembers(id, this.searchStr, this.selectedDepartment ? this.selectedDepartment.id : 0).then((res) => {
            this.members = res.items;
            this.addPhoneNumberField();
        }).catch(() => {
            if (!this.members.length && isDevEnv()) {
                this.mockMembersData();
            }
        }).then(() => {
            this.loading --;
        });
    }

    private getDepartments(sipId: number) {
        this.loading ++;
        this.service.getDepartments(sipId).then((res) => {
            this.service.getMembers(sipId, this.searchStr, this.selectedDepartment ? this.selectedDepartment.id : 0).then((members) => {
                let totalCount: number = 0;
                res.items.forEach( item => {
                    totalCount = totalCount + parseInt(item.employees);
                    item.name = item.name + ' (' + item.employees + ')';
                });

                const all = {'name': this.translate.instant('All members') + ' (' + members.items.length + ')', 'id': 'all', 'count': 0};
                this.departments = [ all, ...res.items];
                this.pbxSelect.options = this.departments;
                this.pbxSelect.fromComponent = true;
                this.selectedDepartment = this.departments[0];
                this.pbxSelect._selected = this.departments[0];

            });
        }).catch(() => {})
          .then(() => this.loading --);
    }

    mockMembersData(): void {
        this.members = [
            {
                phoneNumber: '101',
                sipOuterPhone: '55522233',
                firstName: 'Ivan',
                lastName: 'Petroe',
                statusName: 'enabled'
            },
            {
                phoneNumber: '102',
                sipOuterPhone: '55522233',
                firstName: 'Ivan',
                lastName: 'Petroff',
                statusName: 'enabled'
            },
            {
                phoneNumber: '103',
                sipOuterPhone: '55522233',
                firstName: 'Ivan',
                lastName: 'Sidoroff',
                statusName: 'enabled'
            }
        ];
    }
}
