import {Component, EventEmitter, Output} from '@angular/core';
import {CallQueueService} from '../../../../services/call-queue.service';
import {FadeAnimation} from '../../../../shared/fade-animation';

@Component({
    selector: 'pbx-call-queues-members',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class CallQueuesMembersComponent {
    @Output() onClick: EventEmitter<boolean> = new EventEmitter<boolean>();
    constructor(private service: CallQueueService) {
        this.service.userView.isCurCompMembersAdd = false;
    }

    members = this.service.userView.members;

    table = {
        titles: ['#Ext', 'Phone number', 'First Name', 'Last Name', 'Status'],
        keys: ['phoneNumber', 'sipOuterPhone', 'firstName', 'lastName', 'statusName']
    };

    onClickMembers(): void {
        this.onClick.emit(true);
    }

    deleteMember(memberId) {
        const indexCallQueue = this.service.item.queueMembers.findIndex(el => {
            return el.sipId === memberId;
        });
        const indexView = this.service.userView.members.findIndex(el => {
            return el.id === memberId;
        });
        this.service.item.queueMembers.splice(indexCallQueue, 1);
        this.service.userView.members.splice(indexView, 1);
    }
}
