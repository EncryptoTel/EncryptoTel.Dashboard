import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

import {DepartmentServices} from '../../services/department.services';
import {FadeAnimation} from '../../shared/fade-animation';
import {DepartmentModel, Sip} from '../../models/department.model';
import {validateForm} from '../../shared/shared.functions';


@Component({
    selector: 'pbx-department',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class DepartmentsComponent implements OnInit {
    sidebarEdit = false;
    sidebarVisible = false;
    mode = 'create';
    departmentsList: DepartmentModel[] = [];
    sips: Sip[] = [];
    selectedSips: Sip[] = [];
    tableInfo = {
        titles: ['Department', 'Employees', 'Comment'],
        keys: ['name', 'employees', 'comment']
    };
    departmentForm: FormGroup;
    loading = true;
    currentDepartment: DepartmentModel;

    constructor(private _service: DepartmentServices,
                private fb: FormBuilder) {
    }

    addPhone(): void {
        const sips = this.departmentForm.get('sipInner') as FormArray;
        if (sips.valid && (this.selectedSips.length < this.sips.length)) {
            sips.push(this.createPhoneField());
        }
    }

    addDepartment(): void {
        this.resetForEdit();
        this.reset();
        const sips = this.departmentForm.get('sipInner') as FormArray;
        sips.push(this.createPhoneField());
        this.mode = 'create';
        this.sidebarVisible = true;
        this.sidebarEdit = true;
    }

    cancel(): void {
        if (this.mode === 'create') {
            this.sidebarVisible = false;
        } else {
            this.sidebarEdit = false;
        }
    }

    close(): void {
        this.sidebarVisible = false;
    }

    delete(department: DepartmentModel): void {
        this.loading = true;
        this.sidebarVisible = false;
        this._service.deleteDepartment(department.id).then(() => {
            this.getDepartments();
        }).catch(err => {
            console.error(err);
            this.loading = false;
        });
    }

    edit(department: DepartmentModel): void {
        this.mode = 'edit';
        this.currentDepartment = department;
        this.sidebarEdit = true;
        this.sidebarVisible = true;
        this.departmentForm.get('name').setValue(department.name);
        this.departmentForm.get('comment').setValue(department.comment);
        this.resetForEdit();
        for (let i = 0; i < department.sipInnerIds.length; i++) {
            for (let x = 0; x < this.sips.length; x++) {
                if (department.sipInnerIds[i] === this.sips[x].id) {
                    this.sips[x].blocked = true;
                    this.selectedSips.push(this.sips[x]);
                    const sipsForm = this.departmentForm.get('sipInner') as FormArray;
                    sipsForm.push(this.createPhoneField());
                    sipsForm.get(`${i}`).setValue(this.sips[x].id);
                }
            }
        }
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

    getPhonesCurrentDepartment(department: DepartmentModel): string[] {
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

    save(): void {
        validateForm(this.departmentForm);
        if (this.departmentForm.valid) {
            this.sidebarEdit = false;
            this.sidebarVisible = false;
            this.loading = true;
            if (this.mode === 'create') {
                this._service.saveDepartment({...this.departmentForm.value}).then(() => {
                    this.reset();
                    this.getDepartments();
                }).catch(err => {
                    console.error(err);
                    this.loading = false;
                });
            } else if (this.mode === 'edit') {
                this._service.editDepartment(this.currentDepartment.id, {...this.departmentForm.value}).then(res => {
                    this.reset();
                    this.getDepartments();
                }).catch(err => {
                    console.error(err);
                    this.loading = false;
                });
            }
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

    selectDepartment(department: DepartmentModel): void {
        this.sidebarEdit = false;
        this.sidebarVisible = true;
        this.mode = 'edit';
        this.currentDepartment = department;
    }

    private createPhoneField(): FormControl {
        return this.fb.control('', Validators.required);
    }

    private formatSipOuters(res): void {
        for (let x = 0; x < res.items.length; x++) {
            for (let i = 0; i < res.items[x].sipInners.length; i++) {
                this.sips.push({
                    id: res.items[x].sipInners[i].id,
                    phoneNumber: `${res.items[x].phoneNumber}-${res.items[x].sipInners[i].phoneNumber}`,
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

    private getDepartments(): void {
        this._service.getDepartments().then(res => {
            this.departmentsList = res.items;
            this.departmentsList.map(department => {
                department.employees = department.sipInnerIds.length;
            });
            this.loading = false;
        }).catch(err => {
            console.error(err);
            this.loading = false;
        });
    }

    private getSipOuters(): void {
        this._service.getSipOuters().then(res => {
            this.formatSipOuters(res);
        }).catch(err => {
            console.error(err);
        });
    }

    ngOnInit(): void {
        this.getDepartments();
        this.getSipOuters();
        this.departmentForm = this.fb.group({
            name: [null, [Validators.required, Validators.maxLength(255)]],
            comment: [''],
            sipInner: this.fb.array([])
        });
    }
}
