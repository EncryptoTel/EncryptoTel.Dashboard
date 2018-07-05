import {Component} from '@angular/core';
import {CallQueueService} from '../../../../../../services/call-queue.service';
import {Departments, Members, SipInner} from '../../../../../../models/queue.model';
import {FadeAnimation} from '../../../../../../shared/fade-animation';

@Component({
    selector: 'pbx-call-queues-members-add',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class CallQueuesMembersAddComponent {
    constructor(private service: CallQueueService) {
        if (this.service.callQueue.sipId) {
            this.getMembers(this.service.callQueue.sipId);
            this.getDepartments();
        }
        this.service.userView.isCurCompMembersAdd = true;
    }

    loading = true;
    members: SipInner[] = [];
    departments: any[] = [];
    table = {
        title: {
            titles: ['#Ext', 'Phone number', 'First Name', 'Last Name', 'Status'],
            keys: ['phoneNumber', 'sipOuterPhone', 'firstName', 'lastName', 'statusName']
        }
    };

    selectMember(member: SipInner): void {
        console.log(member);
        const checkResult = this.service.callQueue.queueMembers.find(el => {
            return el.sipId === member.id;
        });
        if (!checkResult) {
            this.service.callQueue.queueMembers.push({sipId: member.id});
            this.service.userView.members.push(member);
        }
    }

    deleteMember(id: number): void {
        const checkResult = this.service.callQueue.queueMembers.findIndex(el => {
            return el.sipId === id;
        });
        if (checkResult >= 0) {
            this.service.callQueue.queueMembers.splice(checkResult, 1);
            this.service.userView.members.splice(checkResult, 1);
        }
    }

    search(event): void {
        const search = event.target.value;
        this.service.search(search).then(res => {
            this.members = res.items;
            this.addPhoneNumberField();
        }).catch(err => {
            console.error(err);
        });
    }

    private getMembers(id: number): void {
        this.service.getMembers(id).then((res: Members) => {
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
        this.service.getDepartments().then((res: Departments) => {
            this.departments = res.items;
        }).catch(err => {
            console.error(err);
        });
    }
}
