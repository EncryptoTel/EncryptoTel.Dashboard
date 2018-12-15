import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {FormGroup, FormBuilder, Validators, FormArray} from '@angular/forms';
import {DepartmentService} from '../../../services/department.service';
import {BaseButton, FilterItem} from '../../../models/base.model';
import {MessageServices} from '../../../services/message.services';
import {RefsServices} from '../../../services/refs.services';
import {CompanyService} from '../../../services/company.service';
import {DepartmentItem} from '../../../models/department.model';
import {Locker, Waiter} from '../../../models/locker.model';
import {FadeAnimation} from '../../../shared/fade-animation';
import {ViewEditControlComponent} from '../../../elements/pbx-view-edit-control/pbx-view-edit-control.component';
import {TabComponent} from '../../../elements/pbx-tabs/tab/pbx-tab.component';
import {TabsComponent} from '../../../elements/pbx-tabs/pbx-tabs.component';
import {FormBaseComponent} from '../../../elements/pbx-form-base-component/pbx-form-base-component.component';
import {InputComponent} from '../../../elements/pbx-input/pbx-input.component';
import { getErrorMessageFromServer } from '@shared/shared.functions';
import {TranslateService} from '@ngx-translate/core';


@Component({
    selector: 'pbx-department-create',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})
export class DepartmentCreateComponent extends FormBaseComponent implements OnInit {

    public sips: any[];
    public filteredSips: any[];
    public selectedSips: any[];
    public sipTableContext: {};

    private _tabsButtons: BaseButton[][];
    private _id: number;
    private _department: DepartmentItem;

    params: object = {
        'class': {
            'enable': false,
            'object': 'formBody',
            'classes': [
                'form-body-fill',
                'form-body-empty'
            ]
        }
    };
    filter: FilterItem;
    currentFilter: any;

    @ViewChild('departmentFormTabs') formTabs: TabsComponent;
    @ViewChild('sipInnersControl') sipInnersControl: ViewEditControlComponent;
    @ViewChild('filterControl') filterControl: InputComponent;

    // -- properties ----------------------------------------------------------

    public get hasId(): boolean {
        return !!this._id && this._id > 0;
    }

    get modelEdit(): boolean {
        return !!this._id && this._id > 0;
    }

    // -- component lifecycle methods -----------------------------------------

    constructor(
        public service: DepartmentService,
        private refs: RefsServices,
        private company: CompanyService,
        private activatedRoute: ActivatedRoute,
        private _messages: MessageServices,
        private router: Router,
        protected fb: FormBuilder,
        protected message: MessageServices,
        public translate: TranslateService
    ) {
        super(fb, message, translate);

        this.locker = new Locker();
        this.sips = [];
        this.filteredSips = [];
        this._id = this.activatedRoute.snapshot.params.id;

        this._tabsButtons = [];
        this._tabsButtons[0] = [
            new BaseButton('Cancel', 'cancel', 'cancel'),
            new BaseButton('Save', 'save', 'success'),
        ];
        this._tabsButtons[1] = [
            new BaseButton('Back', 'back', 'cancel'),
        ];

        this.sipTableContext = {
            titles: [
                this.translate.instant('#Ext'),
                this.translate.instant('Phone number'),
                this.translate.instant('First Name'),
                this.translate.instant('Last Name'),
                this.translate.instant('E-mail'),
                this.translate.instant('Status')],
            keys: ['phoneNumber', 'sipOuterPhoneNumber', 'firstName', 'lastName', 'email', 'statusName']
        };

        this.filter = new FilterItem(1, 'search', this.translate.instant('Search'), null, null, this.translate.instant('Search by Name or Phone'));
        this.currentFilter = {value: null};
    }

    ngOnInit(): void {
        if (this.modelEdit) {
            this.getItem();
        }

        this.getCompany();
        this.getSipOuters();

        Waiter.await(this.locker).then(() => {
            this.mapModelToFormData();
        })
            .catch(() => {
            });

        super.ngOnInit();

        this.sipInnersControl.onEditModeChanged.subscribe(editMode => {
            if (editMode) {
                this.params['class']['classes'][1] = 'form-body-fill';
            } else {
                this.params['class']['classes'][1] = 'form-body-empty';
            }
        });
    }

    // -- form component methods ----------------------------------------------

    initForm(): void {
        this._department = new DepartmentItem();

        this.form = this.fb.group({
            generalForm: this.fb.group({
                name: [this._department.name, [Validators.required, Validators.maxLength(190)]],
                comment: [this._department.comment, [Validators.maxLength(255)]],
            }),
            sipInnersForm: this.fb.group({
                sipInner: this.fb.array([], Validators.required)
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
            const sip = this.sips.find(s => s.id === id);
            this.selectedSips.push(sip);
        });
    }

    // -- data retrieval methods ----------------------------------------------

    getItem(): void {
        this.locker.lock();
        this.service.getItem(this._id).then((response) => {
            this._department = response;
        }).catch(() => {})
          .then(() => this.locker.unlock());
    }

    getCompany() {
        this.locker.lock();
        this.company.getCompany()
            .then(() => {})
            .catch(() => {})
            .then(() => this.locker.unlock());
    }

    getSipOuters(): void {
        this.locker.lock();
        this.refs.getSipOuters().then((response: any) => {
            response.forEach(item => {
                if (item.providerId && item.providerId !== 1) {
                    item.phoneNumber = '+' + item.phoneNumber;
                }
            });
            this.formatSipOuters(response);
        }).catch(() => {})
          .then(() => this.locker.unlock());
    }

    save(): void {
        this.fillSipInnersFormElements();
        if (!this.validateModel()) return;

        this.mapFormDataToModel();

        this.locker.lock();
        this.service.save(this._id, this._department).then((response) => {
            if (!this.modelEdit) {
                this.confirmClose();
            }
            else {
                this._id = response.id;
                this.getItem();
                this.saveFormState();
            }
        }).catch((err) => {
            const msg = getErrorMessageFromServer(err);
            console.log(msg);
            this._messages.writeError(msg, 5000);
        })
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
                statusName: sipInner.statusName,
                email: sipInner.email
            });
        }));
        this.applySipFilter();
    }

    fillSipInnersFormElements(): void {
        if (this.sipInnersControl.selectedItems) {
            this._department.sipInnerIds = [];
            this.sipInnersControl.selectedItems.forEach(sip => this._department.sipInnerIds.push(sip.id));

            this._department.sipInnerIds.forEach(sipId => {
                this.sipInners.push(this.fb.control([sipId, []]));
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

    // -- filtering -----------------------------------------------------------

    applySipFilter(): void {
        if (this.currentFilter.value) {
            this.filteredSips = this.sips.filter(s => {
                return this.matchFilter(s.phoneNumber) || this.matchFilter(s.sipOuterPhoneNumber);
            });
        }
        else {
            this.filteredSips = this.sips;
        }
    }

    resetFilter(): void {
        this.filterControl.clearValue();
        this.currentFilter.value = null;
        this.applySipFilter();
    }

    matchFilter(checkValue: string): boolean {
        return checkValue.indexOf(this.currentFilter.value) >= 0;
    }

    // -- event handlers ------------------------------------------------------

    tabChanged(tab: TabComponent): void {
        if (this.formTabs.selectedTabIndex === 0 && tab.id !== 0) {
            if (!this.validateFormGroup('generalForm')) return;
        }
        this.formTabs.selectTab(tab);
        if (tab.id === 1) {
            this.params['class']['enable'] = true;
        } else {
            this.params['class']['enable'] = false;
        }
        if (this.sipInnersControl.editMode) {
            this.params['class']['classes'][1] = 'form-body-fill';
        } else {
            this.params['class']['classes'][1] = 'form-body-empty';
        }
    }

    buttonClick(action: string): void {
        if (action === 'save') {
            this.save();
        }
        else if (action === 'cancel') {
            this.fillSipInnersFormElements();
            this.close(() => this.confirmClose());
        }
        else if (action === 'back') {
            this.sipInnersControl.editMode = false;
            this.sipInnersControl.onEditModeChanged.emit(this.sipInnersControl.editMode);
            this.resetFilter();
        }
    }

    confirmClose(): void {
        this.router.navigate(['cabinet', 'departments']);
    }
}
