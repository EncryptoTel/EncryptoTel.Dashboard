import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CallQueueService} from '../../../services/call-queue.service';
import {FadeAnimation} from '../../../shared/fade-animation';

@Component({
    selector: 'pbx-call-queues-create',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class CallQueuesCreateComponent implements OnInit, OnDestroy {

    id: number = 0;
    loading: number = 0;

    constructor(public service: CallQueueService,
                private activatedRoute: ActivatedRoute,
                private router: Router) {
        this.id = this.activatedRoute.snapshot.params.id;
    }

    save(): void {
        this.service.save(this.activatedRoute.snapshot.params.id).then(res => {
            this.router.navigate(['cabinet', 'call-queues']);
        });
    }

    cancel(): void {
        this.service.cancel();
        this.router.navigate(['cabinet', 'call-queues']);
    }

    back(): void {
        this.router.navigate(['members'], {relativeTo: this.activatedRoute});
    }

    validation(): boolean {
        return !(
            this.service.callQueue.sipId &&
            this.service.callQueue.name &&
            (this.service.callQueue.name.length < 255) &&
            this.service.callQueue.strategy &&
            this.service.callQueue.timeout &&
            this.service.callQueue.maxlen &&
            this.service.callQueue.queueMembers.length > 0
        );
    }

    private reset() {
        this.service.callQueue = {
            sipId: 0,
            name: '',
            strategy: 0,
            timeout: 30,
            announceHoldtime: 0,
            announcePosition: false,
            maxlen: 60,
            description: '',
            queueMembers: []
        };
        this.service.userView = {
            phoneNumber: '',
            announceHoldtime: false,
            announcePosition: false,
            members: [],
            isCurCompMembersAdd: false,
            strategy: {
                code: ''
            }
        };
    }

    private getParams() {
        this.loading += 1;
        this.service.getParams().then(res => {
            this.loading -= 1;
        }).catch(res => {
            this.loading -= 1;
        });
    }

    private getCallQueue(id) {
        this.loading += 1;
        this.service.getItem(id).then(res => {
            this.service.callQueue.sipId = res.sip.id;
            this.service.callQueue.name = res.name;
            this.service.callQueue.strategy = res.strategy;
            this.service.callQueue.timeout = res.timeout;
            this.service.callQueue.announceHoldtime = res.announceHoldtime;
            this.service.callQueue.announcePosition = res.announcePosition;
            this.service.callQueue.maxlen = res.maxlen;
            this.service.callQueue.description = res.description;
            this.service.userView.phoneNumber = res.sip.phoneNumber;
            this.service.userView.announceHoldtime = res.announceHoldtime !== 0;
            this.setMembers(res.queueMembers);
            this.loading -= 1;
        }).catch(err => {
            console.error(err);
            this.loading -= 1;
        });
    }

    private setMembers(members) {
        console.log('setMembers', members);
        console.log('setMembers.length', members.length);

        for (let i = 0; i < members.length; i++) {
            console.log('member', members[i]);
            this.service.callQueue.queueMembers.push({sipId: members[i].sip.id});
            this.service.userView.members.push(members[i].sip);
            this.service.userView.members[i].sipOuterPhone = this.service.userView.phoneNumber;
        }
        // console.log(this.service.userView.members);
    }

    ngOnInit() {
        if (this.id) {
            this.getCallQueue(this.id);
            this.service.editMode = true;
        } else {
            this.service.editMode = false;
        }
        this.getParams();
    }

    ngOnDestroy() {
        this.reset();
    }

}
