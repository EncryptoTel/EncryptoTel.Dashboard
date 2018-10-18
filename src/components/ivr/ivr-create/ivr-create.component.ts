import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, Validators, FormGroup, ValidationErrors, AbstractControl} from '@angular/forms';

import {IvrService} from '../../../services/ivr.service';
import {FadeAnimation} from '../../../shared/fade-animation';
import {RefsServices} from '../../../services/refs.services';
import {IvrItem, IvrTreeItem, IvrLevelItem} from '../../../models/ivr.model';
import {FormBaseComponent} from '../../../elements/pbx-form-base-component/pbx-form-base-component.component';
import {MessageServices} from '../../../services/message.services';
import {nameRegExp, phoneRegExp} from '../../../shared/vars';
import {SipItem} from '../../../models/call-rules.model';
import {isValidId} from '../../../shared/shared.functions';

export enum DigitActions {
    EXTENSION_NUMBER = 1,
    EXTERNAL_NUMBER = 2,
    SEND_TO_IVR = 3
}


@Component({
    selector: 'pbx-ivr-create',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})
export class IvrCreateComponent extends FormBaseComponent implements OnInit {

    model: IvrItem;

    ivrLevels: IvrLevelItem[];
    sipInners: any[] = [];
    sipOuters: any[] = [];

    selectedItem: IvrTreeItem;  // represents selected IVR digit in tree
    selectedDigits: number[] = [];

    digitForm: FormGroup;
    digitFormKey: string = 'digitForm';

    id: number = 0;
    loading: number = 0;
    loadingExt: number = 0;
    saving: number = 0;
    selectedSipOuter: SipItem;

    // modelTemplate: boolean = true;
    modelTemplate: boolean = false;

    // -- properties ----------------------------------------------------------

    get editMode(): boolean {
        return isValidId(this.id);
    }

    get ivrDigitSelected(): boolean {
        return !!this.selectedItem;
    }

    get formSelectedDigit(): { id: number, title: string } {
        return this.digitForm.get('digit').value;
    }

    get formSelectedAction(): { id: number, title: string } {
        return this.digitForm.get('action').value;
    }

    get sipInnersVisible(): boolean {
        return (this.formSelectedAction
                && this.formSelectedAction.id === <number>DigitActions.EXTENSION_NUMBER);
    }

    get sipOutersVisible(): boolean {
        return (this.formSelectedAction
                && (this.formSelectedAction.id === <number>DigitActions.EXTERNAL_NUMBER));
    }

    get ivrActionsVisible(): boolean {
        return (this.formSelectedAction
                && this.formSelectedAction.id === <number>DigitActions.SEND_TO_IVR);
    }

    // -- component lifecycle methods -----------------------------------------

    constructor(public service: IvrService,
                protected fb: FormBuilder,
                protected message: MessageServices,
                private refs: RefsServices,
                private activatedRoute: ActivatedRoute,
                private router: Router) {
        super(fb, message);
        this.id = this.activatedRoute.snapshot.params.id;

        // Default ValidationHost messages overrides
        this.validationHost.customMessages = [
            { name: 'Ext', error: 'required', message: 'Please choose an extension number' },
        ];
    }

    ngOnInit() {
        super.ngOnInit();
        this.service.reset();

        this.getSipOuters();

        // if (this.id) {
        this.getItem();
        // } 
    }

    // -- form setup and helpers methods --------------------------------------

    initForm(): void {
        this.form = this.fb.group({
            id:             [ null ],
            name:           [ '', [ Validators.required, Validators.pattern(nameRegExp) ] ] ,
            description:    [ '', [ Validators.maxLength(255) ] ],
            sip:            [ null, [ Validators.required ] ],
            // ...
        });

        this.addForm(this.formKey, this.form);

        this.digitForm = this.fb.group({
            id:                 [ null ],
            digit:              [ null, [ Validators.required ] ],
            digitDescription:   [ '', [ Validators.maxLength(255) ] ],
            action:             [ null, [ Validators.required ] ],
            parameter:          [ null, [ Validators.required ] ],
        });

        this.digitForm.get('action').valueChanges
            .subscribe(value => this.onActionChanged(value));

        this.addForm(this.digitFormKey, this.digitForm);
    }

    getActionParameterValidators(): ((control: AbstractControl) => ValidationErrors)[] {
        if (this.digitForm && this.formSelectedAction) {
            switch (this.formSelectedAction.id) {
                case <number>DigitActions.EXTENSION_NUMBER:
                    return [ Validators.required ];
                case <number>DigitActions.EXTERNAL_NUMBER:
                    return [ Validators.required, Validators.pattern(phoneRegExp) ];
                case <number>DigitActions.SEND_TO_IVR:
                    return null;
            }
        }
        return null;
    }

    setBaseFormData(): void {
        super.setFormDataForForm(this.model, this.formKey, () => {
        });
        // console.log('base-form', this.form.value);
    }

    setDigitFormData(): void {
        super.setFormDataForForm(this.selectedItem, this.digitFormKey, () => {
            this.digitForm.get('digitDescription').setValue(this.selectedItem.description);

            const digit = this.service.digits
                .find(d => d.title === this.selectedItem.digit);
            this.digitForm.get('digit').setValue(digit);
            
            const action = this.service.actions
                .find(a => a.title === this.selectedItem.action);
            this.digitForm.get('action').setValue(action);
        });
    }

    // -- event handlers ------------------------------------------------------

    addLevel() {
    }

    onIvrDigitSelected(itemId: number): void {
        if (this.selectedItem) {
            this.closeForm(this.editMode, this.digitFormKey, () => {
                this.selectIvrDigit(itemId);
            });
        }
        else {
            this.selectIvrDigit(itemId);
        }
    }
    
    onDigitSelected(digit: any): void {
        // TODO: check event ...
        // console.log('digit-changed', this.digitForm.value);
    }

    onActionChanged(action: any): void {
        // TODO: check event ...
        // this.selectedDigitAction = action;
        this.digitForm.get('parameter').setValue(null);
        this.digitForm.get('parameter')
            .setValidators(this.getActionParameterValidators());
        this.digitForm.get('parameter').reset();
    }

    onSipOuterSelected(item: SipItem): void {
        console.log('on-sip-outer', item);
        this.getExtensions(item.id);
    }

    save(): void {
        if (!this.validateForms()) {
            return;
        }

        if (this.selectedItem) {
            // Save selected digit form data
            console.log('d-form-value', this.digitForm.value);

            this.setModelData(this.selectedItem, () => {
                const data = this.digitForm.value;
                this.selectedItem.description = data.digitDescription;
                
                this.selectedItem.action = data.action.title;
                if (data.action.id === <number>DigitActions.EXTENSION_NUMBER) {
                    this.selectedItem.parameter = 
                        `${data.parameter.sipOuter.phoneNumber}-${data.parameter.phoneNumber}`;
                }
                else if (data.action.id === <number>DigitActions.EXTERNAL_NUMBER) {
                    this.selectedItem.parameter = data.parameter;
                }
                else {
                    this.selectedItem.parameter = null;
                }
            });
            this.saveFormState(this.digitFormKey);

            console.log('d-model-value', this.selectedItem);
        }
        else {
            // Save base form data
            console.log('form-value', this.form.value);

            this.setModelData(this.model, () => {
                this.model.sipId = this.model.sip.id;
            });
            this.saveFormState(this.formKey);
            
            console.log('model-value', this.model);
        }

        // this.saveIvr();
    }

    onCancel() {
        if (this.selectedItem) {
            this.closeForm(this.editMode, this.digitFormKey, () => this.cancel());
        }
        else {
            this.closeForm(this.editMode, this.formKey, () => this.cancel());
        }
    }

    // -- component methods ---------------------------------------------------

    selectIvrDigit(itemId: number): void {
        const currentDigit = this.selectedItem && this.selectedItem.id === itemId;
        this.selectedItem = null;

        // [ 1, 102, 10201 ]
        // [ 1, 103 ]
        // [ 1 ]

        setTimeout(() => {
            if (currentDigit) {
                this.selectedDigits = this.selectedDigits.filter(d => d < itemId);
            }
            else {
                this.selectedDigits = [];
                this.selectedDigits.push(itemId);

                while (itemId >= 100) {
                    itemId = Math.floor(itemId / 100);
                    this.selectedDigits.push(itemId);
                }
            }

            if (this.selectedDigits.length > 0) {
                itemId = Math.max(...this.selectedDigits);
                this.selectedItem = this.model.tree.find(node => node.id === itemId);
                this.setDigitFormData();
            }
        
            this.initIvrTree();
            // console.log('ivr-digit-selected', this.selectedItem.id, this.selectedDigits);
        }, 0);
    }

    initIvrTree(): void {
        this.ivrLevels = [];
        let levelLimit = this.selectedDigits.length;

        const maxId = Math.max(...this.selectedDigits);
        const lastNode = this.model.tree.find(node => node.id === maxId);
        if (levelLimit === 0 || (lastNode && lastNode.action === 'Send to IVR')) {
            levelLimit++;
        }

        for (let i = 0; i < levelLimit; i++) {
            this.ivrLevels[i] = new IvrLevelItem();
            this.ivrLevels[i].number = i;
            this.ivrLevels[i].title = this.getLevelTitle(i);
            this.ivrLevels[i].description = this.getLevelDescription(i);
            this.ivrLevels[i].items = this.model.tree.filter(node =>
                node.level === i && (this.selectedDigits.indexOf(Math.floor(node.id / 100)) !== -1 || i === 0));
        }

        // console.log('ivr', this.ivrLevels);
    }

    cancel() {
        if (this.selectedItem) {
            this.selectIvrDigit(this.selectedItem.id);
        }
        else {
            this.router.navigate(['cabinet', 'ivr']);
        }
    }

    isLastLevel(index: number): boolean {
        return index + 1 === this.ivrLevels.length;
    }

    getLevelTitle(index: number): string {
        if (index === 0) {
            return this.model.name;
        }
        else {
            const selectedIds = this.selectedDigits.filter(id => id < index * 100);
            const maxId = Math.max(...selectedIds);
            const item = this.model.tree.find(i => i.id === maxId);
            if (item) {
                return item.description;
            }
        }
        return '';
    }

    getLevelDescription(index: number): string {
        return (index === 0)
            ? this.model.description
            : `Level ${index}`;
    }

    // -- data processing methods ---------------------------------------------

    getItem() {
        this.loading++;
        this.service.getById(this.id).then(() => {
            this.selectedSipOuter = this.service.item.sip;
            // TODO:
            this.model = this.service.item;
            this.initIvrTree();
            this.setBaseFormData();
        }).catch(() => {
            // TODO:
            this.model = this.service.item;
            this.initIvrTree();
            this.setBaseFormData();
        }).then(() => this.loading--);
    }

    getSipOuters() {
        this.loading++;
        this.refs.getSipOuters().then(response => {
            this.sipOuters = response;
        }).catch(() => {})
          .then(() => this.loading--);
    }

    getExtensions(id: number): void {
        this.loadingExt++;

        this.service.getExtensions(id).then(response => {
            this.sipInners = response.items;
        }).catch(() => {})
          .then(() => this.loadingExt--);
    }

    saveIvr() {
        this.saving++;
        this.service.save(this.id).then(() => {
            this.cancel();
        }).catch(() => {})
          .then(() => this.saving--);
    }
}
