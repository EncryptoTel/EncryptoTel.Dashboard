import {
    trigger,
    state,
    style,
    transition,
    animate
} from '@angular/animations';
import { Subscription } from 'rxjs/Subscription';
import {
    Component,
    OnInit,
    ViewChild,
    ComponentFactoryResolver,
    OnDestroy,
    ElementRef,
    Output,
    EventEmitter
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidationErrors } from '@angular/forms';

import { IvrService } from '@services/ivr.service';
import { MessageServices } from '@services/message.services';
import { IvrItem, IvrLevel, IvrLevelBase, Digit, MAX_IVR_LEVEL_COUNT } from '@models/ivr.model';
import { FadeAnimation } from '@shared/fade-animation';
import { StorageService } from '@services/storage.service';
import { HostIvrFormDirective } from './directive/host.directive';
import { IvrFormInterface } from './form.interface';
import { IvrDigitFormComponent } from './ivr-digit-form/ivr-digit-form';
import { IvrLevelFormComponent } from './ivr-level-form/ivr-level-form';
import * as _ from 'lodash';
import { ScrollEvent } from '@shared/scroll.directive';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { CanFormComponentDeactivate } from '@services/can-deactivate-form-guard.service';


@Component({
    selector: 'pbx-ivr-create',
    templateUrl: './ivr-create.component.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')],
    providers: [StorageService]
})
export class IvrCreateComponent implements OnInit, CanFormComponentDeactivate {
    state = 'end';
    ivrLevels: Array<IvrLevel> = []; // all levels
    currentLevel: IvrLevel;
    currentDigit: Digit;
    ref = {
        sip: [],
        params: [],
        usedDigit: [],
        sipId: 0,
        levels: []
    };
    ivrData: any;
    id: number;
    loading: number;
    sipOuters: any;
    modelFromServer: IvrItem;

    ivrModelSnapshot: string = null;

    formChangeSubscription: Subscription;
    forms = {
        levelForm: IvrLevelFormComponent,
        digits: IvrDigitFormComponent
    };
    currentForm: IvrFormInterface;
    isValidForm = false;

    @ViewChild(HostIvrFormDirective) hostIvr: HostIvrFormDirective;
    @ViewChild('levelPanel', { read: ElementRef }) panel: ElementRef;

    // -- properties ----------------------------------------------------------

    get editMode(): boolean {
        return !!this.id;
    }

    // -- component lifecycle methods -----------------------------------------

    constructor(
        public service: IvrService,
        protected message: MessageServices,
        private componentFactoryResolver: ComponentFactoryResolver,
        private activatedRoute: ActivatedRoute,
        private storage: StorageService,
        private router: Router
    ) {
        this.id = this.activatedRoute.snapshot.params.id;
    }

    ngOnInit(): void {
        this.loading++;
        this.service.initReferences()
            .then(() => {
                if (this.editMode) {
                    this.getItem(this.id);
                } else {
                    this.initEmptyModel();
                }
                this.loading--;
            });
    }

    initExistsIvr(val) {
        this.modelFromServer = val;

        this.ivrLevels = this.convertIvrItems(this.modelFromServer);
        if (this.ivrLevels.length > 0) {
            this.loadForm(this.forms.levelForm, this.ivrLevels[0]);
        }
        this.ref.levels = this.ivrLevels;

        this.ivrModelSnapshot = this.takeIvrModelSnapshot();
    }

    getItem(id) {
        this.loading++;
        this.service.getById(id)
            .then(val => {
                this.initExistsIvr(val);
            })
            .catch(() => {})
            .then(() => this.loading--);
    }

    initEmptyModel() {
        this.modelFromServer = new IvrItem();

        const newLevel = new IvrLevel();
        newLevel.levelNum = 1;
        newLevel.isVisible = true;
        this.ivrLevels.push(newLevel);
        this.loadForm(this.forms.levelForm, newLevel);

        this.ivrModelSnapshot = this.takeIvrModelSnapshot();
    }

    takeIvrModelSnapshot(): string {
        const model = this.updateIvrModel();
        return JSON.stringify(model);
    }

    loadForm(form, data) {
        this.ref.sipId = this.modelFromServer.sipId;
        if (!this.service.currentSip) {
            this.service.currentSip = this.modelFromServer.sipId;
        }
        if (this.formChangeSubscription) {
            this.formChangeSubscription.unsubscribe();
        }
        if (data instanceof IvrLevel) {
            this.currentLevel = data;
            this.currentDigit = undefined;
        }
        else {
            if (this.currentLevel) {
                this.ref.usedDigit = this.currentLevel.digits.map(d => d.digit);
            }
            this.currentDigit = data;
        }
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
            form
        );
        const viewContainerRef = this.hostIvr.viewContainerRef;
        viewContainerRef.clear();
        const componentRef = viewContainerRef.createComponent(componentFactory);
        this.currentForm = <IvrFormInterface>componentRef.instance;
        this.currentForm.references = this.ref;
        this.currentForm.data = data;
        this.currentForm.onDelete = d => {
            this.deleteDigit();
        };
        this.currentForm.onAddLevel = l => {
            return this.addLevel(l);
        };
        this.formChangeSubscription = this.currentForm.onFormChange.subscribe(
            res => {
                this.onChangeForm(res);
            }
        );
        componentRef.changeDetectorRef.detectChanges();
    }

    onChangeForm(form) {
        this.isValidForm = form.valid;

        if (this.currentForm instanceof IvrDigitFormComponent) {
            this.currentDigit.action = form.value.action;
            this.currentDigit.description = form.value.description;
            this.currentDigit.digit = form.value.digit;
            this.currentDigit.parameter = form.value.parameter;
        }
        else {
            this.currentLevel.sipId = form.value.sipId;
            this.currentLevel.sip = form.value.sip;
            this.currentLevel.enabled = form.value.enabled;
            this.currentLevel.phone = form.value.phone;
            this.currentLevel.loopMessage = form.value.loopMessage;
            this.currentLevel.dateType = form.value.dateType;
            this.currentLevel.dateValue = form.value.dateValue;
            this.currentLevel.timeType = form.value.timeType;
            this.currentLevel.timeValue = form.value.timeValue;
            this.currentLevel.action = form.value.action;
            this.currentLevel.parameter = form.value.parameter;
            this.currentLevel.name = form.value.name;
            this.currentLevel.description = form.value.description;
            this.currentLevel.voiceGreeting = form.value.voiceGreeting;
            this.currentLevel.levelNum = form.value.levelNum;
        }
    }

    convertIvrItems(ivr: IvrItem) {
        try {
            const result = _(ivr.tree)
                .groupBy(x => x.level)
                .map((val, key) => {
                    return new IvrLevel(val, ivr);
                })
                .value();
            return _.orderBy(result, ['levelNum']);
        }
        catch (error) {
            console.error(error);
        }
    }

    convertIvrLevelsToIvrItems(ivr: IvrLevel[]) {
        const data = ivr.map(i => {
            const result = {
                id: i.id,
                name: i.name,
                sipId: i.sipId,
                description: i.description,
                status: 1,
                enabled: i.enabled,
                tree: [
                    {
                        level: i.levelNum,
                        waitTime: 5,
                        digit: 'intro',
                        action: 5,
                        parameter: i.voiceGreeting,
                        description: i.description,
                        name: i.name,
                        loop: i.loopMessage
                    },
                    {
                        level: i.levelNum,
                        waitTime: 5,
                        digit: 'timeout',
                        action: i.action,
                        parameter: i.parameter,
                        description: i.description,
                        name: i.name,
                        loop: i.loopMessage
                    }
                ]
            };
            i.digits.forEach(d => {
                result.tree.push({
                    level: i.levelNum,
                    waitTime: 5,
                    digit: d.digit,
                    action: d.action,
                    parameter: d.parameter,
                    description: d.description,
                    name: d.name || '',
                    loop: 0
                });
            });
            return result;
        });
        const rootElem = data[0];
        for (let i = 1; i < data.length; i++) {
            const element = data[i];
            rootElem.tree.push(...element.tree);
        }
        return rootElem;
    }

    updateIvrModel() {
        const levelIndex = this.ivrLevels.findIndex(
            x => x.levelNum === this.currentLevel.levelNum
        );

        if (levelIndex !== -1) {
            this.ivrLevels[levelIndex] = this.currentLevel;
        }
        else {
            this.ivrLevels.push(this.currentLevel);
        }

        return this.convertIvrLevelsToIvrItems(this.ivrLevels);
    }

    handleScroll(event: ScrollEvent): void {
        if (this.currentForm) {
            this.currentForm.formPanel = event.originalEvent.srcElement;
        }
    }

    save() {
        if (!this.currentForm.getData()) {
            this.currentForm.scrollToFirstError();
            return;
        }

        const data = this.updateIvrModel();

        if (this.editMode) {
            this.service.edit(this.id, data)
                .then(response => {
                    this.initExistsIvr(response);
                    this.isValidForm = true;
                    this.ivrModelSnapshot = this.takeIvrModelSnapshot();
                    this.ref.levels = this.ivrLevels;
                });
        }
        else {
            this.service.save(data)
                .then(() => {
                    this.router.navigate([`cabinet/ivr`]);
                });
        }        
    }

    onIvrSelected(info: { level: IvrLevel, digit: any }) {
        if (info.digit) {
            this.currentLevel = info.level;
            this.visibleOrHideDigit(info.digit);
            this.loadForm(this.forms.digits, info.digit);
            this.currentDigit = info.digit;
        }
        else {
            this.loadForm(this.forms.levelForm, info.level);
            const levelIndex = this.ivrLevels.findIndex(
                x => x.levelNum === this.currentLevel.levelNum
            );
            if (levelIndex !== -1) {
                this.ivrLevels[levelIndex] = this.currentLevel;
            }
            else {
                this.ivrLevels.push(this.currentLevel);
            }
            this.currentLevel = info.level;
            this.ref.levels = this.ivrLevels;
            this.ivrLevels.forEach(l => {
                if (l.levelNum > info.level.levelNum) {
                    l.isVisible = false;
                }
            });
        }
    }

    visibleOrHideDigit(digit) {
        this.ivrLevels.forEach(x => {
            if (x.levelNum > this.currentLevel.levelNum) {
                x.isVisible = false;
            }
        });
        if (digit.action && digit.action.toString() === '7') {
            const nextIvr = this.ivrLevels.find(
                x => x.levelNum.toString() === digit.parameter.toString()
            );
            const visibleLevels = this.ivrLevels.filter(x => x.isVisible || x.levelNum === 1);
            if (visibleLevels[visibleLevels.length - 1].levelNum < nextIvr.levelNum) {
                nextIvr.isVisible = true;
            }
            setTimeout(() => {
                this.panel.nativeElement.scrollLeft += 500;
            }, 300);
        }
    }

    addLevel(l) {
        if (this.ivrLevels.length + 1 <= MAX_IVR_LEVEL_COUNT) {
            l.levelNum = this.ivrLevels.length + 1;
            this.currentDigit.parameter = l.levelNum;
            l.isVisible = true;
            this.onIvrSelected({ level: l, digit: undefined });
        }
        return l.levelNum;
    }

    deleteDigit() {
        this.currentLevel.digits = this.currentLevel.digits.filter(
            x => x !== this.currentDigit
        );
        if (this.currentLevel.digits.length > 0) {
            const curDigit = this.currentLevel.digits[
                this.currentLevel.digits.length - 1
            ];
            this.onIvrSelected({ level: this.currentLevel, digit: curDigit });
        }
        else {
            this.onIvrSelected({ level: this.currentLevel, digit: undefined });
        }
    }

    deleteLevel(e) {
        if (e.levelNum !== 1) {
            const idx = this.ivrLevels.findIndex(
                x => x.levelNum === e.levelNum
            );
            if (idx !== -1) {
                this.ivrLevels.splice(idx, 1);
            }
        }
        this.ref.levels = this.ivrLevels;
    }

    checkFormChanged(): boolean {
      const currentModelSnapshot = this.takeIvrModelSnapshot();
      return this.ivrModelSnapshot !== currentModelSnapshot; 
    }

    onCancel(): void {
        if (this.checkFormChanged()) {
            this.currentForm.showExitModal(this.editMode, () => this.cancel());
        }
        else {
            this.cancel();
        }
    }

    cancel(): void {
        this.router.navigate(['cabinet', 'ivr']);
    }
  
    canDeactivate(dataChanged?: boolean): Observable<boolean> | Promise<boolean> | boolean {
      if (!dataChanged && !this.checkFormChanged()) return true;

      return Observable.create((observer: Observer<boolean>) => {
          this.currentForm.showExitModal(
              this.editMode,
              () => {
                  observer.next(true);
                  observer.complete();
              },
              () => {
                  observer.next(false);
                  observer.complete();
              });
      });
    }

    cancelEdit(event: any): void {
        if (this.currentDigit) {
            this.deleteDigit();
        }
        else {
            this.deleteLevel(this.currentLevel);
        }
    }

    getVisibleLevels(): IvrLevel[] {
        return this.ivrLevels.filter(level => level.isVisible || level.levelNum === 1);
    }

    onDeleteLevel(l: IvrLevel): void {
        // remove all digit linked to level
        this.ivrLevels.forEach(x => {
            x.digits = x.digits.filter(
                d =>
                    !(
                        d.action.toString() === '7' &&
                        d.parameter === l.levelNum.toString()
                    )
            );
        });
        this.ivrLevels = this.ivrLevels.filter(x => x.levelNum !== l.levelNum);

        l.digits.forEach(d => {
            if (
                d.action.toString() === '7' &&
                d.parameter === l.levelNum.toString()
            ) {
                const level = this.ivrLevels.find(
                    x => x.levelNum.toString() === d.parameter
                );
                if (level) {
                    this.onDeleteLevel(level);
                }
            }
        });
        const lastLevel = this.ivrLevels.filter(x => x.isVisible);
        this.onIvrSelected({
            level: lastLevel[lastLevel.length - 1],
            digit: undefined
        });
    }

    deleteLevelWithDependency() {}

    arraymove(arr, fromIndex, toIndex) {
        const element = arr[fromIndex];
        arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, element);
    }
}
