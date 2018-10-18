import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, Validators, FormGroup, ValidationErrors, AbstractControl, ValidatorFn} from '@angular/forms';

import {IvrService} from '@services/ivr.service';
import {RefsServices} from '@services/refs.services';
import {MessageServices} from '@services/message.services';
import {IvrItem, IvrTreeItem, IvrLevelItem} from '@models/ivr.model';
import {SipItem} from '@models/call-rules.model';
import {FormBaseComponent} from '@elements/pbx-form-base-component/pbx-form-base-component.component';
import {FadeAnimation} from '@shared/fade-animation';
import {nameRegExp, phoneRegExp} from '@shared/vars';
import {isValidId} from '@shared/shared.functions';


export enum DigitActions {
    EXTENSION_NUMBER = 1,
    EXTERNAL_NUMBER = 2,
    SEND_TO_IVR = 3
}

/**
 * class IvrCreateComponent
 * 
 * Implements IVR create or edit UI, allows to set as base IVR data as build IVR 
 * navigation menu.
 */
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

    get curentLevelDigits(): number[] {
        let digits: number[] = [];
        
        if (this.selectedItem) {
            const level = this.selectedItem.level;
            const idWeight = Math.floor(this.selectedItem.id / 100);
            digits = this.model.tree
                .filter(node => node.level === level && Math.floor(node.id / 100) === idWeight)
                .map(node => node.id);
        }

        return digits;
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
            { name: 'Select Digit', error: 'invalid-digit', message: 'Digit is already used. Please choose another one.' },
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

    /**
     * Creates base IVR (form) and IVR menu (digitForm) forms. Subscribes to
     * digitForm.actions control changes and adds both forms to the component's
     * forms.
     */
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
            digitId:            [ null ],
            digit:              [ null, [ Validators.required, this.ivrDigitNumberValidator ] ],
            digitDescription:   [ '', [ Validators.maxLength(255) ] ],
            action:             [ null, [ Validators.required ] ],
            parameter:          [ null, [ Validators.required ] ],
        });

        this.digitForm.get('action').valueChanges
            .subscribe(value => this.onActionChanged(value));

        this.addForm(this.digitFormKey, this.digitForm);
    }

    /**
     * Validator checks whther the selected digit in form is free for use
     * at the current level
     * 
     * @returns Validation error or null
     */
    get ivrDigitNumberValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            if (control.value && +control.value.id) {
                if (+control.value.id !== this.selectedItem.id && this.curentLevelDigits.includes(+control.value.id)) {
                    return { 'invalid-digit': { value: control.value } };
                }
            }
            return null;
        };
    }
    
    /**
     * Gets an array of Validators for digitForm.parameter control, depending on 
     * IVR menu item action selected
     * 
     * @return Array of Validators
     */
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

    /**
     * Sets base IVR form data from current IVR model
     */
    setBaseFormData(): void {
        super.setFormDataForForm(this.model, this.formKey, () => {
        });
        // console.log('base-form', this.form.value);
    }

    /**
     * Sets IVR menu form (digitForm) data from current IVR menu item (digit) model
     */
    setDigitFormData(): void {
        console.log('d-form', this.digitForm.value);
        super.setFormDataForForm(this.selectedItem, this.digitFormKey, () => {
            this.digitForm.get('digitId').setValue(this.selectedItem.id);
            this.digitForm.get('digitDescription').setValue(this.selectedItem.description);

            const digit = this.service.digits
                .find(d => d.title === this.selectedItem.digit);
            this.digitForm.get('digit').setValue(digit);
            
            const action = this.service.actions
                .find(a => a.title === this.selectedItem.action);
            this.digitForm.get('action').setValue(action);

            if (action.id === <number>DigitActions.EXTENSION_NUMBER) {
                const sipsParams = this.selectedItem.parameter.split('-');
                const sipInner = this.sipInners.find(sip => sip.phoneNumber === sipsParams[1]);
                this.digitForm.get('parameter').setValue(sipInner);
            }
            else if (action.id === <number>DigitActions.EXTERNAL_NUMBER) {
                this.digitForm.get('parameter').setValue(this.selectedItem.parameter);
            }
        });
    }

    /**
     * Updates current IVR menu item model with IVR menu item form (digitForm) data
     */
    updateDigitModelData(): void {
        // console.log('d-form-value', this.digitForm.value);

        this.saveFormState(this.digitFormKey);
        this.setModelData(this.selectedItem, () => {
            const data = this.digitForm.value;
            
            this.selectedItem.id = data.digitId;
            this.selectedItem.digit = data.digit.id;
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

        this.removeNestedIvrDigits();

        // console.log('d-model-value', this.selectedItem);
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
        this.getExtensions(item.id);
    }

    save(): void {
        if (!this.validateForms()) {
            console.log('form-error', this.form, this.digitForm);
            return;
        }

        if (this.selectedItem) {
            // Save selected digit form data
            const data = this.digitForm.value;
            if (data.action.id !== <number>DigitActions.SEND_TO_IVR && this.itemHasChildIvrDigits()) {
                this.showWarningModal(
                    'Current IVR menu will be deleted. Are you sure to continue?',
                    () => {
                        this.updateDigitModelData();
                    });
            }
            else {
                this.updateDigitModelData();
            }
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
            levelLimit ++;
        }

        for (let i = 0; i < levelLimit; i ++) {
            this.ivrLevels[i] = new IvrLevelItem();
            this.ivrLevels[i].number = i;
            this.ivrLevels[i].title = this.getLevelTitle(i);
            this.ivrLevels[i].description = this.getLevelDescription(i);
            this.ivrLevels[i].items = this.model.tree.filter(node =>
                node.level === i && (this.selectedDigits.indexOf(Math.floor(node.id / 100)) !== -1 || i === 0));
            this.ivrLevels[i].items = this.ivrLevels[i].items.sort(this.sortDigitItems);
        }

        // console.log('ivr', this.ivrLevels);
    }

    sortDigitItems(a: IvrTreeItem, b: IvrTreeItem): number {
        const aValue = +a.digit === 0 ? 10 : +a.digit;
        const bValue = +b.digit === 0 ? 10 : +b.digit;
        
        if (aValue < bValue) return -1;
        else if (aValue > bValue) return 1;
        return 0;
    }

    itemHasChildIvrDigits(): boolean {
        const itemId = this.selectedItem.id;
        let result = false;
        this.model.tree.forEach(node => {
            if (Math.floor(node.id / 100) === itemId) result = true;
        });
        return result;
    }

    removeNestedIvrDigits(): void {
        // console.log(':0', this.selectedItem.id, this.selectedDigits);
        // console.log(':1', this.model.tree);
        const itemId = this.selectedItem.id;
        this.model.tree = this.model.tree.filter(node => Math.floor(node.id / 100) !== itemId);
        // console.log(':2', this.model.tree);
        
        this.initIvrTree();
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

            this.model.sip = this.sipOuters.find(sip => sip.id === this.model.sipId);
            this.getExtensions(this.model.sipId);

            this.initIvrTree();
            this.setBaseFormData();
        }).catch(() => {
            // TODO:
            this.model = this.service.item;

            this.model.sip = this.sipOuters.find(sip => sip.id === this.model.sipId);
            this.getExtensions(this.model.sipId);

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
