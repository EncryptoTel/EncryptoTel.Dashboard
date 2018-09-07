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


@Component({
    selector: 'pbx-department-create',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})
export class DepartmentCreateComponent implements OnInit, Lockable {
    public locker: Locker;
    public departmentForm: FormGroup;
    public sips: any[]; //Sip[];
    public selectedSips: any[] //Sip[] = [];
    public sipTableContext: {};

    private _tabsButtons: BaseButton[][];
    private _id: number;
    private _department: DepartmentItem;

    params: object = {
        'class': {
            'enable': false,
            'object': 'formBody',
            'classes': [
                'class1',
                'class2'
            ]
        }
    };

    @ViewChild('departmentFormTabs') formTabs: TabsComponent;
    @ViewChild('sipInnersControl') sipInnersControl: ViewEditControlComponent;
    errors;


    public get hasId(): boolean {
        return this._id && this._id > 0;
    }

    get sipInners(): FormArray {
        return this.departmentForm.get('sipInner') as FormArray;
    }

    // -- component methods ---------------------------------------------------

    constructor(public service: DepartmentService,
                private _refs: RefsServices,
                private _company: CompanyService,
                private _activatedRoute: ActivatedRoute,
                private _router: Router,
                private _fb: FormBuilder,
                private _message: MessageServices) {
        this.locker = new Locker();
        this.sips = [];
        this._id = this._activatedRoute.snapshot.params.id;
        this._department = new DepartmentItem();

        this._tabsButtons = [];
        this._tabsButtons[0] = [
            new BaseButton('Cancel', 'cancel', 'cancel'),
            new BaseButton('Save', 'save', 'success'),
        ];
        this._tabsButtons[1] = [
            new BaseButton('Back', 'back', 'cancel'),
        ];

        this.departmentForm = this._fb.group({
            generalForm: _fb.group({
                name: [this._department.name, [ Validators.required, Validators.maxLength(190) ]],
                comment: [this._department.comment, [ Validators.maxLength(255) ]],
            }),
            sipInnersForm: _fb.group({
                sipInner: this._fb.array([], Validators.required)
            })
        });

        this.sipTableContext = {
            titles: ['#Ext', 'Phone number', 'Created', 'Status'],
            keys: ['phoneNumber', 'sipOuterPhoneNumber', 'created', 'statusName']
        };
    }

    ngOnInit(): void {
        if (this.hasId) this.getItem();

        this.getCompany();
        this.getSipOuters();

        Waiter.await(this.locker).then(() => {
            this.mapModelToFormData();
        })
        .catch(() => console.log('[department-create] Data retrieval error'));
    }

    // -- Data retrieval methods ----------------------------------------------

    getItem(): void {
        this.locker.lock();
        this.service.getItem(this._id).then((response) => {
            this.locker.unlock();
            this._department = response;
        })
        .catch(() => {
            this.locker.unlock();
        });
    }

    getCompany() {
        this.locker.lock();
        this._company.getCompany().then((response) => {
            this.locker.unlock();
        }).catch(() => {
            this.locker.unlock();
        });
    }

    getSipOuters(): void {
        this.locker.lock();
        this._refs.getSipOuters().then((response: any) => {
            this.formatSipOuters(response);
            this.locker.unlock();
        }).catch(() => {
            this.locker.unlock();
        });
    }

    save(): void {
        this.fillSipInnersFormElements();
        if (!this.validateModel())
            return;

        this.mapFormDataToModel();

        this.locker.lock();
        this.service.save(this._id, this._department).then((response) => {
            this._id = response.id;
            this.locker.unlock();
            this.getItem();
        })
        .catch(() => {
            this.locker.unlock();
        });
    }

    // -- Model data methdos --------------------------------------------------

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
                sipOuterPhoneNumber: item.phoneNumber,
                created: sipInner.created,
                statusName: sipInner.statusName
            });
        }));
    }

    // TODO: automate this...
    mapFormDataToModel(): void {
        // this.fillSipInnersFormElements();
        let generalForm = this.departmentForm.get('generalForm');
        this._department.name = generalForm.get('name').value;
        this._department.comment = generalForm.get('comment').value;
    }

    mapModelToFormData(): void {
        let generalForm = this.departmentForm.get('generalForm');
        generalForm.get('name').setValue(this._department.name);
        generalForm.get('comment').setValue(this._department.comment);

        this._department.sipInnerIds = [2];
        this._department.sipInnerIds.forEach(id => {
            let sip = this.sips.find(sip => sip.id === id);
            this.selectedSips.push(sip);
        });
    }

    fillSipInnersFormElements(): void {
        if (this.sipInnersControl.selectedItems) {
            this._department.sipInnerIds = [];
            this.sipInnersControl.selectedItems.forEach(sip => this._department.sipInnerIds.push(sip.id));

            let sipInnersForm = this.departmentForm.get('sipInnersForm');
            let sipInnerFormArray = <FormArray>sipInnersForm.get('sipInner');
            this._department.sipInnerIds.forEach(sipId => {
                sipInnerFormArray.push(this._fb.control([ sipId, [] ]));
            });
        }
    }

    validateModel(): boolean {
        let generalFormValid = this.validateFormGroup('generalForm');
        let sipInnersFormValid = this.validateFormGroup('sipInnersForm', true, 'Please select at least one member');

        if (!generalFormValid) {
            this.formTabs.selectTabByIndex(0);
            return false;
        }

        if (!sipInnersFormValid) {
            this.formTabs.selectTabByIndex(1);
            return false;
        }

        return true;
    }

    validateFormGroup(groupName: string, showMessage: boolean = false, message: string = ''): boolean {
        let form: FormGroup = <FormGroup>this.departmentForm.get(groupName);
        validateForm(form);
        console.log(groupName, form);
        if (!form.valid && showMessage) {
            this._message.writeError(message);
        }
        return form.valid;
    }

    // -- Model event handlers ------------------------------------------------

    tabChanged(tab: TabComponent): void {
        if (this.formTabs.selectedTabIndex === 0 && tab.id !== 0) {
            if (!this.validateFormGroup('generalForm'))
                return;
        }
        this.formTabs.selectTab(tab);
        if (tab.id === 1) {
            this.params.class.enable = true;
        } else {
            this.params.class.enable = false;
        }
    }

    buttonClick(action: string): void {
        if (action == 'save') {
            this.save();
        }
        else if (action == 'cancel') {
            this._router.navigate([ 'cabinet', 'departments' ]);
        }
        else if (action == 'back') {
            this.sipInnersControl.editMode = false;
        }
    }
}
