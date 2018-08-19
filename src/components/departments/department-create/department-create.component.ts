import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { TimerObservable } from 'rxjs/observable/TimerObservable';
import { DepartmentService } from '../../../services/department.service';
import { BaseButton, Lockable, Locker, InputAction } from '../../../models/base.model';
import { MessageServices } from '../../../services/message.services';
import { RefsServices } from '../../../services/refs.services';
import { CompanyService } from '../../../services/company.service';
import { Sip } from '../../../models/department.model';


@Component({
    selector: 'pbx-department-create',
    templateUrl: './template.html',
})
export class DepartmentCreateComponent implements OnInit, Lockable {
    public locker: Locker;
    public tabsButtons: BaseButton[];
    public departmentForm: FormGroup;
    public sips: Sip[];

    public headerText: string = 'Department Members';
    public generalHeaderText: string = 'Create Department';
    public cmpType: string = 'department';

    public phoneActions: InputAction[];

    constructor(public service: DepartmentService,
                private _refs: RefsServices,
                private _company: CompanyService,
                private _router: Router,
                private _fb: FormBuilder,
                private _message: MessageServices) {
        this.tabsButtons = [
            new BaseButton('Cancel', 'cancel', 'cancel'),
            new BaseButton('Save', 'save', 'success'),
        ];
        
        this.locker = new Locker();

        this.departmentForm = this._fb.group({
            name: [null, [ Validators.required, Validators.maxLength(190) ]],
            comment: [null, [ Validators.maxLength(255) ]],
            sipInner: this._fb.array([])
        });

        this.phoneActions = [];
        this.phoneActions.push(new InputAction(1, 'add-delete', this.sipInners()));

        this.sips = [];
    }

    ngOnInit(): void {
        this.getCompany();
        this.getSipOuters();
    }

    sipInners() {
        return this.departmentForm.get('sipInner') as FormArray;
    }

    buttonClick(action: string): void {
        if (action == 'save') {
            this.save();
        }
        else if (action == 'cancel') {
            this._router.navigate([ 'cabinet', 'departments' ]);
        }
    }

    save(): void {
        this.locker.lock();
        let timer = TimerObservable.create(2000, 0).subscribe(() => {
            timer.unsubscribe();
            this.locker.unlock();
        });
    }
    
    private getCompany() {
        this.locker.lock();
        this._company.getCompany().then((response) => {
            // this.companyActive = !!response.id;
            // this.buttons[0].inactive = !this.companyActive;
            // this.buttons[0].visible = this.companyActive;
            this.locker.unlock();
        }).catch(() => {
            this.locker.unlock();
        });
    }

    private getSipOuters(): void {
        this.locker.lock();
        this._refs.getSipOuters().then(response => {
            this.formatSipOuters(response);
            console.log('sips', response);
            this.locker.unlock();
        }).catch(() => {
            this.locker.unlock();
        });
    }

    private formatSipOuters(items): void {
        for (let x = 0; x < items.length; x++) {
            for (let i = 0; i < items[x].sipInners.length; i++) {
                this.sips.push({
                    id: items[x].sipInners[i].id,
                    phoneNumber: `${items[x].phoneNumber}-${items[x].sipInners[i].phoneNumber}`,
                    blocked: false
                });
            }
        }
        console.log('sips', this.departmentForm.get('sipInner')['controls']);
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
