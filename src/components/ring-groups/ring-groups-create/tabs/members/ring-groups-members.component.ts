import {Component} from '@angular/core';
import {RingGroupService} from '../../../../../services/ring-group.service';
import {FadeAnimation} from '../../../../../shared/fade-animation';

@Component({
    selector: 'ring-groups-members',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class RingGroupsMembersComponent {
    constructor(private service: RingGroupService) {
        this.service.userView.isCurCompMembersAdd = false;
    }

    members = this.service.userView.members;

    table = {
        title: {
            titles: ['#Ext', 'Phone number', 'First Name', 'Last Name', 'Status'],
            keys: ['phoneNumber', 'sipOuterPhone', 'firstName', 'lastName', 'statusName']
        }
    };

    deleteMember(memberId) {
        const indexCallQueue = this.service.item.queueMembers.findIndex(el => {
            if (el.sipId === memberId) {
                return true;
            }
        });
        const indexView = this.service.userView.members.findIndex(el => {
            if (el.id === memberId) {
                return true;
            }
        });
        this.service.item.queueMembers.splice(indexCallQueue, 1);
        this.service.userView.members.splice(indexView, 1);
    }
}
