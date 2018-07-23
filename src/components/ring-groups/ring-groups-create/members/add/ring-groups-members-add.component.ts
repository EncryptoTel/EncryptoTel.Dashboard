import {Component, OnInit} from '@angular/core';
import {FadeAnimation} from '../../../../../shared/fade-animation';
import {RingGroupService} from '../../../../../services/ring-group.service';
import {RefsServices} from '../../../../../services/refs.services';

@Component({
    selector: 'ring-groups-members-add',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class RingGroupsMembersAddComponent implements OnInit {

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

    constructor(public service: RingGroupService,
                private refs: RefsServices) {}

    selectMember(member): void {
        const index = this.service.item.queueMembers.findIndex(el => {
            return el.sipId === member.id; });
        if (index === -1) {
            this.service.item.queueMembers.push({sipId: member.id});
            this.service.userView.members.push(member);
        } else {
            this.service.item.queueMembers.splice(index, 1);
            this.service.userView.members.splice(this.service.userView.members.findIndex(el => {
              return el.id === member.id; }), 1);
        }
    }

    deleteMember(member): void {
        let checkResult = this.service.item.queueMembers.findIndex(el => {
            return el.sipId === member.id;
        });
        if (checkResult >= 0) {
            this.service.item.queueMembers.splice(checkResult, 1);
        }
        checkResult = this.service.userView.members.findIndex(el => {
            return el.id === member.id;
        });
        if (checkResult >= 0) {
            this.service.userView.members.splice(checkResult, 1);
        }
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
            this.members[i].sipOuterPhone = this.service.userView.phoneNumber;
        }
    }

    private getDepartments() {
        this.loading++;
        this.refs.getDepartments().then((res) => {
            this.departments = res;
            this.selectedDepartment = this.departments[0];
            this.loading--;
        }).catch(() => {
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
