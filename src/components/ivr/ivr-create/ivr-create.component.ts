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
    digitForm: FormGroup;

    selectedDigitAction: any = {};
    selectedDigits: number[] = [];
    selectedSipOuter: any = {};
    selectedSipInner: any = {};

    id: number = 0;
    loading: number = 0;
    loadingExt: number = 0;
    saving: number = 0;
    numbers = [];
    selectedNumber;

    // modelTemplate: boolean = true;
    modelTemplate: boolean = false;

    constructor(public service: IvrService,
                protected fb: FormBuilder,
                protected message: MessageServices,
                private refs: RefsServices,
                private activatedRoute: ActivatedRoute,
                private router: Router) {
        super(fb, message);
        this.id = this.activatedRoute.snapshot.params.id;
    }

    // -- properties ----------------------------------------------------------

    get ivrDigitSelected(): boolean {
        return !!this.selectedItem;
    }

    get sipInnersVisible(): boolean {
        return (this.selectedDigitAction 
            && this.selectedDigitAction.id === <number>DigitActions.EXTENSION_NUMBER
            && this.selectedSipOuter && this.selectedSipOuter.sipId > 0);
    }

    get sipOutersVisible(): boolean {
        return (this.selectedDigitAction 
            && (this.selectedDigitAction.id === <number>DigitActions.EXTERNAL_NUMBER 
                || this.selectedDigitAction.id === <number>DigitActions.EXTENSION_NUMBER));
    }

    get ivrActionsVisible(): boolean {
        return (this.selectedDigitAction && this.selectedDigitAction.id === <number>DigitActions.SEND_TO_IVR);
    }

    // -- component lifecycle methods -----------------------------------------
    
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
            name:           [ '', [ Validators.required, Validators.pattern(nameRegExp) ] ],
            description:    [ '', [ Validators.maxLength(255) ] ],
            sip:            [ null, [ Validators.required ] ],
            // ...
        });

        this.digitForm = this.fb.group({
            id:             [ null ],
            digit:          [ null, [ Validators.required ] ],
            description:    [ '', [ Validators.maxLength(255) ] ],
            action:         [ null, [ Validators.required ] ],
            parameter:      [ null, c => this.actionParameterValidators() ],
        });
    }
    
    actionParameterValidators(): ((control: AbstractControl) => ValidationErrors)[] {
        if (this.digitForm) {
            const action = this.digitForm.get('action').value;
            switch (action) {
                // Redirect to extension number
                case 1: return [ Validators.required ];
                // Redirect to external number
                case 2: return [ Validators.required, Validators.pattern(phoneRegExp) ];
                // Send to IVR
                case 3: return null;
            }
        }
        return null;
    }

    setFormData(): void {
        super.setFormData(this.model, () => {});
        console.log('form-value', this.form.value);
    }

    // -- event handlers ------------------------------------------------------

    addLevel() {}

    onIvrDigitSelected(itemId: number): void {
        const hideDigit = this.selectedItem && this.selectedItem.id === itemId;
        this.selectedItem = null;

        setTimeout(() => {
            this.selectedDigits = [];
            if (!hideDigit) {
                this.selectedItem = this.model.tree.find(node => node.id === itemId);
                this.selectedDigits.push(itemId);
    
                const action = this.service.actions.find(a => a.title === this.selectedItem.action);
                this.selectDigitAction(action);
                // if (this.selectedItem.action == 'Send to IVR') {}
            }
            // highlight parent digits
            while (itemId >= 100) {
                itemId = Math.floor(itemId / 100);
                this.selectedDigits.push(itemId);
            }
            this.initIvrTree();
    
            // console.log('digit-selected', this.selectedItem);
        }, 0);
    }

    selectDigitAction(action: any): void {
        this.selectedDigitAction = action;
        // console.log('digit-action', this.selectedDigitAction);
    }

    selectSipOuter(item: any): void {
        console.log('sip-outer-selected', item, this.selectedSipOuter, this.sipInnersVisible);
        this.selectedSipOuter = item;
        if (this.sipInnersVisible) {
            this.getExtensions(item.sipId);
        }
    }

    save(): void {
        if (!this.validateForms()) { return; }
        console.log('form-value', this.form.value);

        this.setModelData(this.model, () => {
            this.model.sipId = this.model.sip.id;
        });
        console.log('model-value', this.model);

        // this.saveIvr();
        
        // if (this.selectedItem) {
        //     // IVR Digit
        //     console.log('sel-item', this.selectedItem);
        //     console.log('sel-action', this.selectedDigitAction);
        //     this.selectedItem.action = this.selectedDigitAction.title;
        // }
        // else {
        //     // IVR General
        // }
    }

    cancel() {
        this.router.navigate(['cabinet', 'ivr']);
    }

    // -- component methods ---------------------------------------------------

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
        }

        // console.log('ivr', this.ivrLevels);
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
        this.loading ++;
        this.service.getById(this.id).then(() => {
            this.selectedNumber = this.service.item.sip;
            // TODO:
            this.model = this.service.item;
            this.initIvrTree();
            this.setFormData();
        }).catch(() => {
            // TODO:
            this.model = this.service.item;
            this.initIvrTree();
            this.setFormData();
        })
          .then(() => this.loading --);
    }

    getSipOuters() {
        this.loading ++;
        this.refs.getSipOuters().then(response => {
            this.sipOuters = response;
        }).catch(() => {
        })
          .then(() => this.loading --);
    }
    
    getExtensions(id: number): void {
        this.loadingExt ++;

        this.service.getExtensions(id).then(response => {
            this.sipInners = response.items;
            }).catch(() => {})
          .then(() => this.loadingExt --);
    }

    saveIvr() {
        this.saving ++;
        this.service.save(this.id).then(() => {
            this.cancel();
        }).catch(() => {})
          .then(() => this.saving --);
    }
}
