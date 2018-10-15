import {Component, OnInit, ChangeDetectorRef, ApplicationRef} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {IvrService} from "../../../services/ivr.service";
import {FadeAnimation} from '../../../shared/fade-animation';
import {RefsServices} from "../../../services/refs.services";
import {IvrItem, IvrTreeItem, IvrLevelItem} from '../../../models/ivr.model';


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
export class IvrCreateComponent implements OnInit {

    model: IvrItem;
    
    ivrLevels: IvrLevelItem[];
    sipInners: any[] = [];
    sipOuters: any[] = [];
    
    selectedItem: IvrTreeItem;
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
                private refs: RefsServices,
                private activatedRoute: ActivatedRoute,
                private router: Router) {
        this.id = this.activatedRoute.snapshot.params.id;
    }

    // -- properties ----------------------------------------------------------

    get ivrDigitSelected(): boolean {
        return !!this.selectedItem;
    }

    get sipInnersVisible(): boolean {
        return (this.selectedDigitAction 
            && this.selectedDigitAction.id == <number>DigitActions.EXTENSION_NUMBER
            && this.selectedSipOuter && this.selectedSipOuter.sipId > 0);
    }

    get sipOutersVisible(): boolean {
        return (this.selectedDigitAction 
            && (this.selectedDigitAction.id == <number>DigitActions.EXTERNAL_NUMBER 
                || this.selectedDigitAction.id == <number>DigitActions.EXTENSION_NUMBER));
    }

    get ivrActionsVisible(): boolean {
        return (this.selectedDigitAction && this.selectedDigitAction.id == <number>DigitActions.SEND_TO_IVR);
    }

    // -- component lifecycle methods -----------------------------------------
    
    ngOnInit() {
        this.service.reset();

        if (this.id) {
            this.getItem();
        } else {

        }

        // TODO: remove it
        this.getItem();
        
        this.getSipOuters();
    }

    // -- form setup and helpers methods --------------------------------------

    initForm(): void {
        // ...
    }

    // -- event handlers ------------------------------------------------------

    addLevel() {}

    onDigitSelected(itemId: number): void {
        this.selectedItem = null;

        setTimeout(() => {
            this.selectedDigits = [];
            if (this.selectedItem && this.selectedItem.id === itemId) {
                // this.selectedItem = null;
            }
            else {
                this.selectedItem = this.model.tree.find(node => node.id === itemId);
                this.selectedDigits.push(itemId);
    
                let action = this.service.actions.find(a => a.title == this.selectedItem.action);
                this.selectDigitAction(action);
                // if (this.selectedItem.action == 'Send to IVR') {}
            }
            // highlight parent digits
            while (itemId >= 100) {
                itemId = ~~ (itemId / 100);
                this.selectedDigits.push(itemId);
            }
            this.initIvrTree();
    
            // console.log('digit-selected', this.selectedItem);
        }, 0);
    }

    selectDigitAction(action: any): void {
        this.selectedDigitAction = action;
        console.log('digit-action', this.selectedDigitAction);
    }

    selectSipOuter(item: any): void {
        // console.log('sip-outer-selected', item, this.selectedSipOuter, this.sipInnersVisible);
        this.selectedSipOuter = item;
        if (this.sipInnersVisible) {
            this.getExtensions(item.sipId);
        }
    }

    save(): void {
        // this.saveIvr();
    }

    cancel() {
        this.router.navigate(['cabinet', 'ivr']);
    }

    // -- component methods ---------------------------------------------------

    initIvrTree(): void {
        this.ivrLevels = [];
        let levelLimit = this.selectedDigits.length;

        const maxId = Math.max(...this.selectedDigits);
        const lastNode = this.model.tree.find(node => node.id == maxId);
        if (levelLimit == 0 || (lastNode && lastNode.action == 'Send to IVR')) 
            levelLimit ++;

        for (let i = 0; i < levelLimit; i ++) {
            this.ivrLevels[i] = new IvrLevelItem();
            this.ivrLevels[i].number = i;
            this.ivrLevels[i].title = this.getLevelTitle(i);
            this.ivrLevels[i].description = this.getLevelDescription(i);
            this.ivrLevels[i].items = this.model.tree.filter(node => 
                node.level == i && (this.selectedDigits.indexOf(~~ (node.id / 100)) !== -1 || i === 0));
        }

        // console.log('ivr', this.ivrLevels);
    }

    isLastLevel(index: number): boolean {
        return index + 1 === this.ivrLevels.length;
    }

    getLevelTitle(index: number): string {
        if (index === 0) return this.model.name;
        else {
            let selectedIds = this.selectedDigits.filter(id => id < index * 100);
            let maxId = Math.max(...selectedIds);
            let item = this.model.tree.find(item => item.id == maxId);
            if (item) return item.description; 
        };
        return '';
    }

    getLevelDescription(index: number): string {
        if (index === 0) return this.model.description;
        else return `Level ${index}`;
    }

    // -- data processing methods ---------------------------------------------

    getItem() {
        this.loading ++;
        this.service.getById(this.id).then(() => {
            this.selectedNumber = this.service.item.sip;
            // TODO:
            this.model = this.service.item;
            this.initIvrTree();
        }).catch(() => {
            // TODO:
            this.model = this.service.item;
            this.initIvrTree();
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
