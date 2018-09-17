import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FadeAnimation} from '../../shared/fade-animation';
import {MessageServices} from '../../services/message.services';
import {FormComponent} from '../pbx-form/pbx-form.component';

@Component({
    selector: 'pbx-queue-create',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class QueueCreateComponent implements OnInit {

    @Input() service;
    @Input() name: string;
    @Input() headerText: string;
    @Input() generalHeaderText: string;
    @Input() cmpType;

    @ViewChild(FormComponent) form: FormComponent;

    id = 0;
    loading = 0;
    saving = 0;
    tabs = ['General', 'Members'];
    activeTabs = [true, true];
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
        if (tab === 'Members' && (!this.service.item.sipId || !this.service.item.name || !this.service.item.strategy)) {
            this.form.selected = 'General';
            let errors = [];
            if (!this.service.item.sipId) {
                errors['sip'] = 'Please select phone number';
            }
            if (!this.service.item.name) {
                errors['name'] = 'Please enter name';
            }
            if (!this.service.item.strategy) {
                errors['strategy'] = 'Please select ring strategy';
            }
            this.service.errors = errors;
            return;
        }
        this.currentTab = tab;
    }

    save(): void {
        this.saving++;
        this.service.save(this.id, true, (res) => {
            if (res && res.errors) {
                if (res.errors.queueMembers) {
                    this.message.writeError(this.form.selected === 'Members' ? 'You have not selected members' : 'You must select members');
                }
                return true;
            }
        }).then(() => {
            this.saving--;
            if (!this.id) {
                this.cancel();
            }
        }).catch(() => {
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
