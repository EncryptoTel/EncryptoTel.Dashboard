import {Component, OnInit, ViewChild} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

import {DepartmentService} from '../../services/department.service';
import {FadeAnimation} from '../../shared/fade-animation';
import {DepartmentItem, DepartmentModel, Sip} from '../../models/department.model';
import {validateForm} from '../../shared/shared.functions';
import {RefsServices} from '../../services/refs.services';
import {ListComponent} from "../../elements/pbx-list/pbx-list.component";


@Component({
    selector: 'pbx-department',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class DepartmentsComponent implements OnInit {
    @ViewChild(ListComponent) list;

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
    selected: DepartmentItem;
    pageInfo: DepartmentModel = new DepartmentModel();

    constructor(private service: DepartmentService,
                private fb: FormBuilder,
                private refs: RefsServices) {

        this.departmentForm = this.fb.group({
            name: [null, [Validators.required, Validators.maxLength(255)]],
            comment: [''],
            sipInner: this.fb.array([])
        });

    }

    addPhone(): void {
        const sips = this.departmentForm.get('sipInner') as FormArray;
        if (sips.valid && (this.selectedSips.length < this.sips.length)) {
            sips.push(this.createPhoneField());
        }
    }

    create(): void {
        this.resetForEdit();
        this.reset();
        const sips = this.departmentForm.get('sipInner') as FormArray;
        sips.push(this.createPhoneField());
        this.sidebar.mode = 'edit';
        this.sidebar.visible = true;
    }

    close(): void {
        this.selected = null;
        this.sidebar.visible = false;
    }

    edit(item: DepartmentItem): void {
        this.sidebar.mode = 'edit';
        this.selected = item;
        this.sidebar.visible = true;
        this.departmentForm.get('name').setValue(item.name);
        this.departmentForm.get('comment').setValue(item.comment);
        this.resetForEdit();
        for (let i = 0; i < item.sipInnerIds.length; i++) {
            for (let x = 0; x < this.sips.length; x++) {
                if (item.sipInnerIds[i] === this.sips[x].id) {
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

    save(): void {
        validateForm(this.departmentForm);
        if (this.departmentForm.valid) {
            this.loading++;
            this.service.save(this.selected ? this.selected.id : null, this.departmentForm.value).then(() => {
                this.reset();
                this.getDepartments();
                this.close();
                this.loading--;
            }).catch(() => {
                this.loading--;
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
        return this.fb.control('', Validators.required);
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

    private getDepartments(): void {
        this.loading++;
        this.service.getItems(this.pageInfo).then((res: DepartmentModel) => {
            this.pageInfo = res;
            // this.departmentsList.map(department => {
            //     department.employees = department.sipInnerIds.length;
            // });
            this.loading--;
        }).catch(err => {
            this.loading--;
        });
    }

    private getSipOuters(): void {
        this.sidebar.loading++;
        this.refs.getSipOuters().then(res => {
            this.formatSipOuters(res);
            this.sidebar.loading--;
        }).catch(() => {
            this.sidebar.loading--;
        });
    }

    ngOnInit(): void {
        this.getDepartments();
        this.getSipOuters();
    }
}
