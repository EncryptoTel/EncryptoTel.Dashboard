import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FadeAnimation} from '../../shared/fade-animation';
import {MessageServices} from '../../services/message.services';
import {FormComponent} from '../pbx-form/pbx-form.component';
import {isValidId} from '../../shared/shared.functions';
import {FormBuilder, Validators} from '@angular/forms';
import {FormBaseComponent} from '../pbx-form-base-component/pbx-form-base-component.component';
import {numberRegExp} from '../../shared/vars';
import {ringTimeValidator} from '../../shared/encry-form-validators';

@Component({
    selector: 'pbx-queue-create',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class QueueCreateComponent extends FormBaseComponent implements OnInit {

    @Input() name: string;
    @Input() service: any;

    @Input() headerText: string;
    @Input() generalHeaderText: string;
    @Input() cmpType;

    @ViewChild(FormComponent) formComponent: FormComponent;

    id: number = 0;

    loading: number = 0;
    saving: number = 0;
    
    tabs: string[] = [ 'General', 'Members' ];
    activeTabs: boolean[] = [ true, true ];
    currentTab: string = 'General';
    
    confirm: {} = { value: 'Save', buttonType: 'success', inactive: this.saving !== 0 };
    decline: {} = {
        standard: {value: 'Cancel', buttonType: 'cancel'},
        member: {value: 'Back', buttonType: 'cancel'},
    };

    addMembersMode: boolean = false;

    // -- properties ----------------------------------------------------------

    get model(): any {
        return this.service.item;
    }
    set model(value: any) {
        this.service.item = value;
    }

    get hasId(): boolean {
        return isValidId(this.id);
    }

    get tabGeneralActive(): boolean {
        return this.currentTab === this.tabs[0];
    }

    get tabMembersInViewModeActive(): boolean {
        return this.currentTab === this.tabs[1] && !this.addMembersMode;
    }

    get tabMembersInEditModeActive(): boolean {
        return this.currentTab === this.tabs[1] && this.addMembersMode;
    }

    // -- component lifecycle methods -----------------------------------------

    constructor(public router: Router,
                private _activatedRoute: ActivatedRoute,
                protected _fb: FormBuilder,
                protected _message: MessageServices) {
        super(_fb, _message);

        this.id = this._activatedRoute.snapshot.params.id;
        this.currentTab = this.tabs[0];

        this.validationHost.customMessages = [
            { name: 'Ring Time', error: 'range', message: 'Please enter value between 15 and 600' },
            { name: 'Ring Time', error: 'pattern', message: 'Please enter valid number' },
        ];
    }

    ngOnInit(): void {
        this.service.reset();
        this.service.editMode = this.hasId;

        if (this.hasId) {
            this.getModel(this.id);
        }
        else {
            this.saveFormState();
            this.getParams();
        }

        super.ngOnInit();
    }

    initForm(): void {
        // Called from parent class constructor
        this.form = this._fb.group({
            id: [ '' ],
            name: [ '', [ Validators.required ] ],
            description: [ '' ],
            sip: [ null, [ Validators.required ] ],         // Phone number
            strategy: [ null, [ Validators.required ] ],    // Ring strategy
            timeout: [ '', [ Validators.required, Validators.pattern(numberRegExp), ringTimeValidator(15, 600) ] ],     // Ring time
            // members: [ null, [ Validators.required ] ],  // Members
        });
    }

    // -- event handlers ------------------------------------------------------

    selectTab(tab: string): void {
        if (!this.validateForms()) return;

        this.addMembersMode = false;
        this.currentTab = tab;

        this.setModelData();
    }

    addMembers(mode: boolean) {
        this.addMembersMode = mode;
        this.service.saveMembersBefore();
    }

    save(): void {
        if (!this.validateForms()) return;

        this.setModelData();
        // this.saveModel();
        
        console.log('form', this.form.value);
        console.log('model', this.model);
    }

    cancel(): void {
        this.close(this.service.editMode, () => this.cancelConfirm());
    }

    cancelConfirm(): void {
        this.router.navigate(['cabinet', this.name]);
    }

    back(): void {
        this.addMembersMode = false;
        let message = this.service.getMembersMessage();
        message && this._message.writeSuccess(message);
    }

    // -- component model methods ---------------------------------------------

    setModelData(): void {
        super.setModelData(this.model, () => {
            this.model.sipId = this.form.get('sip').value.id;
            delete this.model.sip;
            this.model.strategy = this.model.strategy.id;
        });
    }

    // -- data processing methods ---------------------------------------------

    getModel(id: number) {
        this.loading ++;
        this.service.getItem(id).then(() => {
            this.getParams();
            this.setFormData(this.model);
            console.log('on-get', this.model, this.form.value);
        }).catch(() => {})
          .then(() => this.loading --);
    }

    getParams() {
        this.loading ++;
        this.service.getParams().then(() => {})
          .catch(() => {})
          .then(() => this.loading --);
    }

    saveModel(): void {
        this.saving ++;
        this.service.save(this.id, true, (response) => {
            this.saveFormState();
            if (response && response.errors) {
                if (response.errors.queueMembers) {
                    this._message.writeError(this.formComponent.selected === 'Members' 
                        ? 'You have not selected members' 
                        : 'You must select members');
                }
                return true;
            }
        }).then(() => { if (!this.id) this.cancel(); })
          .catch(() => {})
          .then(() => this.saving --);
    }
}
