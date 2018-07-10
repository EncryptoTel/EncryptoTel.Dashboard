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
    saving: boolean = false;

    constructor(public service: CallQueueService,
                private activatedRoute: ActivatedRoute,
                private router: Router) {
        this.id = this.activatedRoute.snapshot.params.id;
    }

    save(): void {
        this.saving = true;
        this.service.save(this.id).then(res => {
            this.router.navigate(['cabinet', 'call-queues']);
            this.saving = false;
        });
    }

    cancel(): void {
        this.router.navigate(['cabinet', 'call-queues']);
    }

    back(): void {
        this.router.navigate(['members'], {relativeTo: this.activatedRoute});
    }

    validation(): boolean {
        return !(
            this.service.item.sipId &&
            this.service.item.name &&
            (this.service.item.name.length < 255) &&
            this.service.item.strategy &&
            this.service.item.timeout &&
            // this.service.item.maxlen &&
            this.service.item.queueMembers.length > 0
        );
    }

    private reset() {
        this.service.reset();
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
            this.service.item.sipId = res.sip.id;
            this.service.item.name = res.name;
            this.service.item.strategy = res.strategy;
            this.service.item.timeout = res.timeout;
            this.service.item.announceHoldtime = res.announceHoldtime;
            this.service.item.announcePosition = res.announcePosition;
            this.service.item.maxlen = res.maxlen;
            this.service.item.description = res.description;
            this.service.userView.phoneNumber = res.sip.phoneNumber;
            this.service.userView.announceHoldtime = res.announceHoldtime !== 0;
            this.setMembers(res.queueMembers);
            this.getParams();
            this.loading -= 1;
        }).catch(err => {
            console.error(err);
            this.loading -= 1;
        });
    }

    private setMembers(members) {
        for (let i = 0; i < members.length; i++) {
            this.service.item.queueMembers.push({sipId: members[i].sip.id});
            this.service.userView.members.push(members[i].sip);
            this.service.userView.members[i].sipOuterPhone = this.service.userView.phoneNumber;
        }
        // console.log(this.service.userView.members);
    }

    ngOnInit() {
        this.reset();
        if (this.id) {
            this.getCallQueue(this.id);
            this.service.editMode = true;
        } else {
            this.service.editMode = false;
            this.getParams();
        }
    }

    ngOnDestroy() {
        this.reset();
    }

}
