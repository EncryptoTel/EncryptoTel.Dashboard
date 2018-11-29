import {Component, OnInit, ViewChild} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

import {DepartmentService} from '../../services/department.service';
import {FadeAnimation} from '../../shared/fade-animation';
import {DepartmentItem, DepartmentModel, Sip} from '../../models/department.model';
import {validateForm} from '../../shared/shared.functions';
import {RefsServices} from '../../services/refs.services';
import {ListComponent} from '../../elements/pbx-list/pbx-list.component';
import {CompanyService} from '../../services/company.service';
import {ButtonItem, InputAction} from '../../models/base.model';


@Component({
    selector: 'pbx-department',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [CompanyService],
    animations: [FadeAnimation('300ms')]
})
export class DepartmentsComponent implements OnInit {

    @ViewChild(ListComponent) list;
    filters: any;
    sidebar = {
        visible: false,
        loading: 0,
        saving: 0,
        mode: ''
    };
    sips: Sip[] = [];
    selectedSips: Sip[] = [];
    table = {
        titles: ['Department', 'Employees', 'Comment'],
        keys: ['name', 'employees', 'comment']
    };
    departmentForm: FormGroup;
    loading = 0;
    saving = 0;
    selected: DepartmentItem;
    pageInfo: DepartmentModel = new DepartmentModel();
    companyActive = false;
    buttons: ButtonItem[] = [];
    phoneActions: InputAction[] = [];

    constructor(public service: DepartmentService,
                private _fb: FormBuilder,
                private _refs: RefsServices,
                private _company: CompanyService) {

        this.buttons.push({
            id: 0,
            title: 'Add Department',
            type: 'success',
            visible: true,
            inactive: true,
            buttonClass: '',
            icon: false
        });

        this.departmentForm = this._fb.group({
            name: [null, [Validators.required, Validators.maxLength(190)]],
            comment: [null, [Validators.maxLength(255)]],
            sipInner: this._fb.array([])
        });

        this.phoneActions.push(new InputAction(1, 'add-delete', this.sipInners()));

    }

    sipInners() {
        return this.departmentForm.get('sipInner') as FormArray;
    }

    addPhone(): void {
        if (this.sipInners().valid && (this.selectedSips.length < this.sips.length)) {
            this.sipInners().push(this.createPhoneField());
        }
    }

    create(): void {
        console.log('create');
        // this.resetForEdit();
        // this.reset();
        // const sips = this.departmentForm.get('sipInner') as FormArray;
        // sips.push(this.createPhoneField());
        // this.sidebar.mode = 'edit';
        // this.sidebar.visible = true;
    }

    close(): void {
        this.selected = null;
        this.sidebar.visible = false;
    }

    edit(item: DepartmentItem): void {
        console.log('edit', item);
        // this.sidebar.mode = 'edit';
        // this.selected = item;
        // this.departmentForm.get('name').setValue(item.name);
        // this.departmentForm.get('comment').setValue(item.comment);
        // this.resetForEdit();
        // const sipsForm = this.departmentForm.get('sipInner') as FormArray;

        // if (item.sipInnerIds.length === 0) {
        //     sipsForm.push(this.createPhoneField());
        // }

        // for (let i = 0; i < item.sipInnerIds.length; i++) {
        //     for (let x = 0; x < this.sips.length; x++) {
        //         if (item.sipInnerIds[i] === this.sips[x].id) {
        //             this.sips[x].blocked = true;
        //             this.selectedSips.push(this.sips[x]);
        //             sipsForm.push(this.createPhoneField());
        //             sipsForm.get(`${i}`).setValue(this.sips[x].id);
        //         }
        //     }
        // }
        // this.sidebar.visible = true;
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

    getPhonesCurrentDepartment(department: DepartmentItem): string[] {
        const phoneNumbers = [];
        for (let i = 0; i < department.sipInnerIds.length; i++) {
            for (let x = 0; x < this.sips.length; x++) {
                if (department.sipInnerIds[i] === this.sips[x].id) {
                    phoneNumbers.push(this.sips[x].phoneNumber);
                }
            }
        }
        return phoneNumbers;
    }

    checkEmpty() {
        const sips = this.departmentForm.get('sipInner') as FormArray;
        if (sips.length > 0) {
            for (let i = sips.length - 1; i >= 0; i--) {
                if (!sips.controls[i].value) {
                    sips.removeAt(i);
                }
            }
        }
    }

    save(): void {
        validateForm(this.departmentForm);
        if (this.departmentForm.valid) {
            this.checkEmpty();
            this.saving++;
            this.service.save(this.selected ? this.selected.id : null, this.departmentForm.value).then(() => {
                this.reset();
                this.list.getItems();
                this.close();
                this.saving--;
            }).catch((err) => {
                this.addPhone();
                this.saving--;
            });
        }
    }

    selectPhone(phone: Sip, index: number): void {
        this.selectedSips[index] = phone;
        const sips = this.departmentForm.get('sipInner') as FormArray;
        sips.controls[index].setValue(phone.id);
        this.sips.forEach(sip => {
            sip.blocked = false;
        });
        this.selectedSips.forEach(sip => {
            sip.blocked = true;
        });
    }

    select(item: DepartmentItem): void {
        this.sidebar.mode = 'view';
        this.sidebar.visible = this.sidebar.visible ? this.selected !== item : true;
        this.selected = item;
    }

    private createPhoneField(): FormControl {
        return this._fb.control('', []);
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
    }

    private reset(): void {
        this.departmentForm.reset();
        this.selectedSips = [];
        this.sips.forEach(sip => {
            sip.blocked = false;
        });
    }

    private resetForEdit(): void {
        const sipsForm = this.departmentForm.get('sipInner') as FormArray;
        sipsForm.controls = [];
        this.selectedSips = [];
        this.sips.forEach(sip => {
            sip.blocked = false;
        });
    }

    private getSipOuters(): void {
        this.sidebar.loading++;
        this._refs.getSipOuters().then(res => {
            this.formatSipOuters(res);
            this.sidebar.loading--;
        }).catch(() => {
            this.sidebar.loading--;
        });
    }

    private getCompany() {
        this.loading++;
        this._company.getCompany().then((res) => {
            this.companyActive = !!res.id;
            this.buttons[0].inactive = !this.companyActive;
            this.buttons[0].visible = this.companyActive;
            this.loading--;
        }).catch((res) => {
            this.loading--;
        });
    }

    getEmptyInfo() {
        return `<span class="empty_company">To get started with the module Departments<br/>fill in the data in the <a class="link_empty_company" href="/cabinet/company">module Company</a></span>`;
    }

    ngOnInit(): void {
        this.getCompany();
        this.getSipOuters();
    }
}
