import {Component} from '@angular/core';
import {CallQueueService} from '../../../../../../services/call-queue.service';
import {FadeAnimation} from '../../../../../../shared/fade-animation';

@Component({
    selector: 'pbx-call-queues-members-add',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class CallQueuesMembersAddComponent {

    constructor(private service: CallQueueService) {
        if (this.service.item.sipId) {
            this.getMembers(this.service.item.sipId);
            this.getDepartments();
        }
        this.service.userView.isCurCompMembersAdd = true;
    }

    loading = true;
    members = [];
    departments: any[] = [];
    table = {
        title: {
            titles: ['#Ext', 'Phone number', 'First Name', 'Last Name', 'Status'],
            keys: ['phoneNumber', 'sipOuterPhone', 'firstName', 'lastName', 'statusName']
        }
    };

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

    deleteMember(member): void {
        // console.log('deleteMember', member);
        const checkResult = this.service.item.queueMembers.findIndex(el => {
            return el.sipId === member.id;
        });
        if (checkResult >= 0) {
            this.service.item.queueMembers.splice(checkResult, 1);
            this.service.userView.members.splice(checkResult, 1);
        }
    }

    search(event): void {
        const search = event.target.value;
        this.service.getMembers(this.service.item.id, search).then(res => {
            this.members = res.items;
            this.addPhoneNumberField();
        }).catch(err => {
            console.error(err);
        });
    }

    private getMembers(id: number): void {
        this.service.getMembers(id).then((res) => {
            this.members = res.items;
            this.loading = false;
            this.addPhoneNumberField();
        }).catch(err => {
            console.error(err);
        });
    }

    private addPhoneNumberField(): void {
        for (let i = 0; i < this.members.length; i++) {
            this.members[i].sipOuterPhone = this.service.userView.phoneNumber;
        }
    }

    private getDepartments() {
        this.service.getDepartments().then((res) => {
            this.departments = res.items;
        }).catch(err => {
            console.error(err);
        });
    }
}
