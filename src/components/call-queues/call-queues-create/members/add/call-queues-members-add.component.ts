import {Component} from '@angular/core';
import {FadeAnimation} from '../../../../../shared/fade-animation';
import {CallQueueService} from '../../../../../services/call-queue.service';
import {RefsServices} from "../../../../../services/refs.services";

@Component({
    selector: 'pbx-call-queues-members-add',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class CallQueuesMembersAddComponent {

    loading: number = 0;
    members = [];
    departments: any[] = [];
    selectedDepartment;
    table = {
        title: {
            titles: ['#Ext', 'Phone number', 'First Name', 'Last Name', 'Status'],
            keys: ['phoneNumber', 'sipOuterPhone', 'firstName', 'lastName', 'statusName']
        }
    };
    searchTimeout;
    searchStr: string = '';
    id: number = 0;

    constructor(private service: CallQueueService,
                private refs: RefsServices) {
        this.service.userView.isCurCompMembersAdd = true;
    }

    selectMember(member): void {
        // console.log(member);
        const checkResult = this.service.item.queueMembers.find(el => {
            return el.sipId === member.id;
        });
        if (!checkResult) {
            this.service.item.queueMembers.push({sipId: member.id});
            this.service.userView.members.push(member);
        }
    }

    deleteMember(id: number): void {
        const checkResult = this.service.item.queueMembers.findIndex(el => {
            return el.sipId === id;
        });
        if (checkResult >= 0) {
            this.service.item.queueMembers.splice(checkResult, 1);
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
        }).catch(err => {
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
