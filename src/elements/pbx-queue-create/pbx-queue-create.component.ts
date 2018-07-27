import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FadeAnimation} from '../../shared/fade-animation';
import {MessageServices} from "../../services/message.services";
import {FormComponent} from "../pbx-form/pbx-form.component";

@Component({
    selector: 'pbx-queue-create',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class QueueCreateComponent implements OnInit {

    @Input() service;
    @Input() name: string;

    @ViewChild(FormComponent) form: FormComponent;

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

    constructor(private activatedRoute: ActivatedRoute,
                public router: Router,
                private message: MessageServices) {
        this.id = this.activatedRoute.snapshot.params.id;
    }

    selectTab(tab: string): void {
        this.addMembers = false;
        if (tab === 'Members' && !this.service.item.sipId) {
            this.form.selected = 'General';
            this.service.errors = {sip: 'Please select phone number'};
            return;
        }
        this.currentTab = tab;
    }

    save(): void {
        this.saving++;
        this.service.save(this.id).then(res => {
            this.saving--;
            if (!this.id) this.cancel();
        }).catch(res => {
            this.saving--;
        });
    }

    cancel(): void {
        this.router.navigate(['cabinet', this.name]);
    }

    back(): void {
        this.addMembers = false;
        let message = this.service.getMembersMessage();
        message ? this.message.writeSuccess(message) : null;
        // this.router.navigate(['members'], {relativeTo: this.activatedRoute});
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

    doAddMembers($event) {
        this.addMembers = $event;
        this.service.saveMembersBefore();
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
