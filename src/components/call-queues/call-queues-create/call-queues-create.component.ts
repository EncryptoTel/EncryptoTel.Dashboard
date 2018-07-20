import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CallQueueService} from '../../../services/call-queue.service';
import {FadeAnimation} from '../../../shared/fade-animation';

@Component({
    selector: 'pbx-call-queues-create',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class CallQueuesCreateComponent implements OnInit {

  id = 0;
  loading = 0;
  saving = 0;
  tabs = ['General', 'Members'];
  confirm = {value: 'Save', buttonType: 'success', inactive: this.saving !== 0};
  decline = {
    standard: {value: 'Cancel', buttonType: 'cancel'},
    member: {value: 'Back', buttonType: 'cancel'},
  };
  currentTab = 'General';
  addMembers = false;

    constructor(public service: CallQueueService,
                private activatedRoute: ActivatedRoute,
                public router: Router) {
        this.id = this.activatedRoute.snapshot.params.id;
    }

    /* selectMembersTab() {
        this.service.errors && this.service.errors.queueMembers ? this.service.errors.queueMembers = null : null;
    } */

    selectTab(tab: string): void {
        this.addMembers = false;
        this.currentTab = tab;
    }

    save(): void {
        this.saving++;
        this.service.save(this.id).then(res => {
            this.saving--;
            this.cancel();
        }).catch(res => {
            this.saving--;
        });
    }

    cancel(): void {
        this.router.navigate(['cabinet', 'call-queues']);
    }

    back(): void {
        this.addMembers = false;
        this.router.navigate(['members'], {relativeTo: this.activatedRoute});
    }

    getItem(id: number) {
        this.loading++;
        this.service.getItem(id).then(() => {
            this.getParams();
            this.loading--;
        }).catch(() => {
            this.loading--;
        });
    }

    getParams() {
        this.loading++;
        this.service.getParams().then(() => {
            this.loading--;
        }).catch(() => {
            this.loading--;
        });
    }

    ngOnInit() {
        this.service.reset();
        this.service.editMode = this.id && this.id > 0;
        if (this.id) {
            this.getItem(this.id);
        } else {
            this.getParams();
        }
    }

}
