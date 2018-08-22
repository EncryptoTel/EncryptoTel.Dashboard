import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { TimerObservable } from 'rxjs/observable/TimerObservable';
import { DepartmentService } from '../../../services/department.service';
import { BaseButton, InputAction } from '../../../models/base.model';
import { MessageServices } from '../../../services/message.services';
import { RefsServices } from '../../../services/refs.services';
import { CompanyService } from '../../../services/company.service';
import { Sip } from '../../../models/department.model';
import { Lockable, Locker, Waiter } from '../../../models/locker.model';
import { FadeAnimation } from '../../../shared/fade-animation';
import { ViewEditControlComponent } from '../../../elements/pbx-view-edit-control/pbx-view-edit-control.component';


@Component({
    selector: 'pbx-department-create',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})
export class DepartmentCreateComponent implements OnInit, Lockable {
    public locker: Locker;
    public departmentForm: FormGroup;

    private _tabsButtons: BaseButton[][];
    private _sipInnersEditMode: boolean;

    public sipTable: {};
    
    private _id: number;

    @ViewChild('sipInnersControl') sipInnersControl: ViewEditControlComponent;
    
    public get hasId(): boolean {
        return this._id && this._id > 0;
    }

    get sipInners(): FormArray {
        return this.departmentForm.get('sipInner') as FormArray;
    }

    // --- ??? --- 
    public sips: any[] //Sip[];
    public selectedSips: any[] //Sip[] = [];

    public cmpType: string = 'department';

    public phoneActions: InputAction[];
    public companyActive = false;
    // --- ??? --- 


    // -- component related methods -------------------------------------------

    constructor(public service: DepartmentService,
                private _refs: RefsServices,
                private _company: CompanyService,
                private _activatedRoute: ActivatedRoute,
                private _router: Router,
                private _fb: FormBuilder,
                private _message: MessageServices) {

        this.locker = new Locker();
        this._id = this._activatedRoute.snapshot.params.id;
        this._sipInnersEditMode = false;
        console.log('id', this._id);

        this._tabsButtons = [];
        this._tabsButtons[0] = [
            new BaseButton('Cancel', 'cancel', 'cancel'),
            new BaseButton('Save', 'save', 'success'),
        ];
        this._tabsButtons[1] = [
            new BaseButton('Back', 'back', 'cancel'),
        ];
        
        this.departmentForm = this._fb.group({
            name: [null, [ Validators.required, Validators.maxLength(190) ]],
            comment: [null, [ Validators.maxLength(255) ]],
            sipInner: this._fb.array([
                [null, []]
            ])
        });

        this.sipTable = {
            titles: ['#Ext', 'Phone number', 'Created', 'Status'],
            keys: ['phoneNumber', 'sipOuterPhoneNumber', 'created', 'statusName']
        };

        // --- ??? --- 
        this.phoneActions = [];
        this.phoneActions.push(new InputAction(1, 'add-delete', this.sipInners));

        this.sips = [];
        // --- ??? --- 
    }

    ngOnInit(): void {
        this.service.reset();
        this.service.editMode = this.hasId;

        if (this.hasId) {
            this.getItem(this._id);
        } 

        this.getCompany();
        this.getSipOuters();

        Waiter.await(this.locker).then(() => {
            console.log('form', this.sipInners.controls);
            // TODO: populate 'Params' and Entity
        })
        .catch(() => console.log('[department-create] Data retrieval error'));
    }

    // -- Data retrieval methods ----------------------------------------------

    getItem(id: number): void {
        this.locker.lock();
        this.service.getItem(id).then((response) => {
            this.locker.unlock();
            // TODO: get data ...
            console.log('item', response);
        })
        .catch(() => this.locker.unlock());
    }
    
    getCompany() {
        this.locker.lock();
        this._company.getCompany().then((response) => {
            console.log('company', response);
            this.companyActive = !!response.id;
            // this.buttons[0].inactive = !this.companyActive;
            // this.buttons[0].visible = this.companyActive;
            this.locker.unlock();
        }).catch(() => {
            this.locker.unlock();
        });
    }

    getSipOuters(): void {
        this.locker.lock();
        this._refs.getSipOuters().then((response: any) => {
            console.log('sipOuters', response);
            this.formatSipOuters(response);
            this.locker.unlock();
        }).catch(() => {
            this.locker.unlock();
        });
    }

    // -- Model data methdos --------------------------------------------------

    tabsButtons(): BaseButton[] {
        const index = this.sipInnersControl.editMode ? 1 : 0;
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
                // id: sipInner.id,
                // phoneNumber: `${item.phoneNumber}-${sipInner.phoneNumber}`,
                // blocked: false
            });
        }));
    }

    addEmptySipToForm(): void {
        const emptySip = this._fb.control(null, []);
        this.sipInners.push(emptySip);
    }

    sipInnersEditModeChanged(mode: boolean): void {
        this._sipInnersEditMode = mode;
    }

    // -- Model event handlers ------------------------------------------------

    onAddSipInner(): void {}
    deleteSipMember(sip: any): void {}

    // -- ??? -----------------------------------------------------------------

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

    save(): void {
        this.locker.lock();
        let timer = TimerObservable.create(2000, 0).subscribe(() => {
            timer.unsubscribe();
            this.locker.unlock();
        });
    }
    
    getSelectNumbers(): Sip[] {
        const array = [];
        this.sips.forEach(sip => {
            if (!sip.blocked) {
                array.push(sip);
            }
        });
        return array;
    }
}
