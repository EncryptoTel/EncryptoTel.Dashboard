import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {RingGroupService} from '../../../services/ring-group.service';
import {FadeAnimation} from '../../../shared/fade-animation';
import {MessageServices} from "../../../services/message.services";


@Component({
    selector: 'ring-groups-create-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class RingGroupsCreateComponent implements OnInit {

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

    constructor(public service: RingGroupService,
                private activatedRoute: ActivatedRoute,
                private router: Router,
                private message: MessageServices) {
        this.id = this.activatedRoute.snapshot.params.id;
    }

    selectTab(tab: string): void {
        this.addMembers = false;
        this.currentTab = tab;
    }

    save(): void {
        this.saving++;
        this.service.save(this.id).then(() => {
            this.saving--;
            this.cancel();
        }).catch(() => {
            this.saving--;
        });
    }

    cancel(): void {
        this.router.navigate(['cabinet', 'ring-groups']);
    }

    back(): void {
        this.addMembers = false;
        let message = '';
        this.service.membersAdded > 0 ? message = `${this.service.membersAdded} member(s) added successfully` : null;
        this.service.membersDeleted > 0 ? message = `${message ? `${message}, ` : ''}${this.service.membersDeleted} member(s) removed successfully` : null;
        message ? this.message.writeSuccess(message) : null;
        this.service.resetMemberCounters();
        this.router.navigate(['members'], {relativeTo: this.activatedRoute});
    }

    getItem(id: number) {
        this.loading++;
        this.service.getItem(id).then(res => {
            this.getParams();
            this.loading--;
        }).catch(err => {
            this.loading--;
        });
    }

    getParams() {
        this.loading++;
        this.service.getParams().then(res => {
            this.loading--;
        }).catch(res => {
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
