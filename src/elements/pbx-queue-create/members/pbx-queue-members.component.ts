import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CallQueueService} from '../../../services/call-queue.service';
import {FadeAnimation} from '../../../shared/fade-animation';
import {isDevEnv} from '../../../shared/shared.functions';


@Component({
    selector: 'pbx-queue-members',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})
export class QueueMembersComponent implements OnInit {

    @Input() service;
    @Input() headerText = 'Call Queue Members';
    @Input() noDataMessage = 'No data to display';

    @Output() onClick: EventEmitter<boolean> = new EventEmitter<boolean>();

    members: any[];

    table = {
        titles: ['#Ext', 'Phone number', 'First Name', 'Last Name', 'Email', 'Status'],
        keys: ['phoneNumber', 'sipOuterPhone', 'firstName', 'lastName', 'email', 'statusName']
    };

    // -- properties ----------------------------------------------------------

    get hasData(): boolean {
        return !!this.members && this.members.length > 0;
    }

    // -- component lifecycle methods -----------------------------------------

    constructor() {}

    ngOnInit() {
        this.service.userView.isCurCompMembersAdd = false;
        this.members = this.service.userView.members;
    }

    // -- event handlers ------------------------------------------------------

    addMember(): void {
        this.onClick.emit(true);
    }

    deleteMember(memberId) {
        console.log(this.service.item);
        console.log('memberId', memberId);
        const indexCallQueue = this.service.item.queueMembers.findIndex(el => {
            return el.sipId === memberId.id;
        });
        console.log('indexCallQueue', indexCallQueue);
        const indexView = this.service.userView.members.findIndex(el => {
            return el.id === memberId.id;
        });
        this.service.item.queueMembers.splice(indexCallQueue, 1);
        this.service.userView.members.splice(indexView, 1);
    }
}
