import {Component, Input, OnInit} from '@angular/core';
import {FadeAnimation} from '../../../../shared/fade-animation';
import {RefsServices} from '../../../../services/refs.services';
import {isDevEnv} from '../../../../shared/shared.functions';


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
        keys: ['phoneNumber', 'sipOuterPhone', 'firstName', 'lastName', 'email', 'statusName']
    };
    searchTimeout;
    searchStr = '';
    id = 0;

    // -- component lifecycle methods -----------------------------------------

    constructor(private refs: RefsServices) {}

    ngOnInit() {
        if (this.service.item.sipId) {
            this.getMembers(this.service.item.sipId);
            this.getDepartments();
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
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        this.searchStr = event.target.value;
        this.searchTimeout = setTimeout(() => {
            this.getMembers(this.id);
        }, 500);

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
        }).then(() => this.loading --);
    }

    private getDepartments() {
        this.loading ++;
        this.service.getDepartments().then((res) => {
            let all: any;
            all = {'name': 'All member', 'id': 'all'};
            this.departments = [ all, ...res.items];
            this.selectedDepartment = this.departments[0];
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
