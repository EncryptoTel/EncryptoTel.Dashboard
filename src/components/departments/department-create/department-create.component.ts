import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { TimerObservable } from 'rxjs/observable/TimerObservable';
import { DepartmentService } from '../../../services/department.service';
import { BaseButton, InputAction } from '../../../models/base.model';
import { MessageServices } from '../../../services/message.services';
import { RefsServices } from '../../../services/refs.services';
import { CompanyService } from '../../../services/company.service';
import { Sip, DepartmentItem } from '../../../models/department.model';
import { Lockable, Locker, Waiter } from '../../../models/locker.model';
import { FadeAnimation } from '../../../shared/fade-animation';
import { ViewEditControlComponent } from '../../../elements/pbx-view-edit-control/pbx-view-edit-control.component';
import { TabComponent } from '../../../elements/pbx-tabs/tab/pbx-tab.component';
import { TabsComponent } from '../../../elements/pbx-tabs/pbx-tabs.component';
import { validateForm } from '../../../shared/shared.functions';
import { FormBaseComponent } from '../../../elements/pbx-form-base-component/pbx-form-base-component.component';


@Component({
    selector: 'pbx-department-create',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})
export class DepartmentCreateComponent extends FormBaseComponent implements OnInit {
    public locker: Locker;
    public sips: any[];
    public selectedSips: any[];
    public sipTableContext: {};

    private _tabsButtons: BaseButton[][];
    private _id: number;
    private _department: DepartmentItem;

    params: object = {};

    @ViewChild('departmentFormTabs') formTabs: TabsComponent;
    @ViewChild('sipInnersControl') sipInnersControl: ViewEditControlComponent;

    // -- properties ----------------------------------------------------------

    public get hasId(): boolean {
        return !!this._id && this._id > 0;
    }

    // -- component lifecycle methods -----------------------------------------

    constructor(public service: DepartmentService,
                private _refs: RefsServices,
                private _company: CompanyService,
                private _activatedRoute: ActivatedRoute,
                private _router: Router,
                protected _fb: FormBuilder,
                protected _message: MessageServices) {
        super(_fb, _message);

        this.params = {
            'class': {
                'enable': false,
                'object': 'formBody',
                'classes': [
                    'class1',
                    'class2'
                ]
            }
        };

        this.locker = new Locker();
        this.sips = [];
        this._id = this._activatedRoute.snapshot.params.id;

        this._tabsButtons = [];
        this._tabsButtons[0] = [
            new BaseButton('Cancel', 'cancel', 'cancel'),
            new BaseButton('Save', 'save', 'success'),
        ];
        this._tabsButtons[1] = [
            new BaseButton('Back', 'back', 'cancel'),
        ];

        this.sipTableContext = {
            titles: ['#Ext', 'Phone number', 'First Name', 'Last Name', 'Created', 'Status'],
            keys: ['phoneNumber', 'sipOuterPhoneNumber', 'firstName', 'lastName', 'created', 'statusName']
        };
    }

    ngOnInit(): void {
        if (this.hasId) {
            this.getItem();
        }

        this.getCompany();
        this.getSipOuters();

        Waiter.await(this.locker).then(() => {
            this.mapModelToFormData();
        })
        .catch(() => {});

        super.ngOnInit();
    }

    // -- form component methods ----------------------------------------------

    initForm(): void {
        this._department = new DepartmentItem();

        this.form = this._fb.group({
            generalForm: this._fb.group({
                name: [this._department.name, [ Validators.required, Validators.maxLength(190) ]],
                comment: [this._department.comment, [ Validators.maxLength(255) ]],
            }),
            sipInnersForm: this._fb.group({
                sipInner: this._fb.array([], Validators.required)
            })
        });
    }

    get departmentForm(): FormGroup {
        return this.form;
    }

    get generalForm(): FormGroup {
        return this.form.get('generalForm') as FormGroup;
    }

    get sipInners(): FormArray {
        const sipInnersForm = this.departmentForm.get('sipInnersForm');
        return sipInnersForm.get('sipInner') as FormArray;
    }

    // TODO: automate this...
    mapFormDataToModel(): void {
        this._department.name = this.generalForm.get('name').value;
        this._department.comment = this.generalForm.get('comment').value;
    }

    mapModelToFormData(): void {
        this.selectedSips = [];
        this.generalForm.get('name').setValue(this._department.name);
        this.generalForm.get('comment').setValue(this._department.comment);
        this.saveFormState();

        this._department.sipInnerIds.forEach(id => {
            const sip = this.sips.find(sip => sip.id === id);
            this.selectedSips.push(sip);
        });
    }

    // -- data retrieval methods ----------------------------------------------

    getItem(): void {
        this.locker.lock();
        this.service.getItem(this._id).then((response) => {
            this._department = response;
        })
        .catch(() => {})
          .then(() => this.locker.unlock());
    }

    getCompany() {
        this.locker.lock();
        this._company.getCompany().then(() => {})
          .catch(() => {})
          .then(() => this.locker.unlock());
    }

    getSipOuters(): void {
        this.locker.lock();
        this._refs.getSipOuters().then((response: any) => {
            this.formatSipOuters(response);
        }).catch(() => {})
          .then(() => this.locker.unlock());
    }

    save(): void {
        this.fillSipInnersFormElements();
        if (!this.validateModel())
            return;

        this.mapFormDataToModel();

        this.locker.lock();
        this.service.save(this._id, this._department).then((response) => {
            this._id = response.id;
            this.getItem();
            this.saveFormState();
        })
        .catch(() => {})
          .then(() => this.locker.unlock());
    }

    // -- model data methdos --------------------------------------------------

    tabsButtons(): BaseButton[] {
        let index: number;
        if (this.formTabs.selectedTabIndex === 1) {
            index = this.sipInnersControl.editMode ? 1 : 0;
        }
        else {
            index = 0;
        }
        return this._tabsButtons[index];
    }

    formatSipOuters(items: any[]): void {
        this.sips = [];
        items.forEach(item => item.sipInners.forEach(sipInner => {
            this.sips.push({
                id: sipInner.id,
                phoneNumber: sipInner.phoneNumber,
                firstName: sipInner.firstName,
                lastName: sipInner.lastName,
                sipOuterPhoneNumber: item.phoneNumber,
                created: sipInner.created,
                statusName: sipInner.statusName
            });
        }));
    }

    fillSipInnersFormElements(): void {
        if (this.sipInnersControl.selectedItems) {
            this._department.sipInnerIds = [];
            this.sipInnersControl.selectedItems.forEach(sip => this._department.sipInnerIds.push(sip.id));

            this._department.sipInnerIds.forEach(sipId => {
                this.sipInners.push(this._fb.control([ sipId, [] ]));
            });
        }
    }

    validateModel(): boolean {
        const generalFormValid = this.validateFormGroup('generalForm');
        // const sipInnersFormValid = this.validateFormGroup('sipInnersForm', true, 'Please select at least one member');

        if (!generalFormValid) {
            this.formTabs.selectTabByIndex(0);
            return false;
        }

        // if (!sipInnersFormValid) {
        //     this.formTabs.selectTabByIndex(1);
        //     return false;
        // }

        return true;
    }

    // -- event handlers ------------------------------------------------------

    tabChanged(tab: TabComponent): void {
        if (this.formTabs.selectedTabIndex === 0 && tab.id !== 0) {
            if (!this.validateFormGroup('generalForm'))
                return;
        }
        this.formTabs.selectTab(tab);
        if (tab.id === 1) {
            this.params['class']['enable'] = true;
        } else {
            this.params['class']['enable'] = false;
        }
    }

    buttonClick(action: string): void {
        if (action == 'save') {
            this.save();
        }
        else if (action == 'cancel') {
            this.fillSipInnersFormElements();
            this.close(this.hasId, () => this.confirmClose());
        }
        else if (action == 'back') {
            this.sipInnersControl.editMode = false;
        }
    }

    confirmClose(): void {
        this._router.navigate([ 'cabinet', 'departments' ]);
    }
}
