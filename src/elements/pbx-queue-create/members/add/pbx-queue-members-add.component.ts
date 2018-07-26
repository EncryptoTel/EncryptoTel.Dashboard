import {Component, Input, OnInit} from '@angular/core';
import {FadeAnimation} from '../../../../shared/fade-animation';
import {RefsServices} from '../../../../services/refs.services';

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
        titles: ['#Ext', 'Phone number', 'First Name', 'Last Name', 'Status'],
        keys: ['phoneNumber', 'sipOuterPhone', 'firstName', 'lastName', 'statusName']
    };
    searchTimeout;
    searchStr = '';
    id = 0;

    constructor(private refs: RefsServices) {
    }

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

    private getMembers(id: number): void {
        this.id = id;
        this.loading++;
        this.service.getMembers(id, this.searchStr, this.selectedDepartment ? this.selectedDepartment.id : 0).then((res) => {
            this.members = res.items;
            this.loading--;
            this.addPhoneNumberField();
        }).catch(() => {
            this.loading--;
            // console.error(err);
        });
    }

    private addPhoneNumberField(): void {
        for (let i = 0; i < this.members.length; i++) {
            this.members[i].sipOuterPhone = this.service.userView.phoneNumber.code;
        }
    }

    private getDepartments() {
        this.loading++;
        this.refs.getDepartments().then((res) => {
            this.departments = res;
            this.selectedDepartment = this.departments[0];
            this.loading--;
        }).catch(err => {
            this.loading--;
            // console.error(err);
        });
    }

    ngOnInit() {
        if (this.service.item.sipId) {
            this.getMembers(this.service.item.sipId);
            this.getDepartments();
        }
    }

}
