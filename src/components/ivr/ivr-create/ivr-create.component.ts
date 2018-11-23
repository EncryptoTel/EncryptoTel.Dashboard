import { Subscription } from 'rxjs/Subscription';
import {
    Component,
    OnInit,
    ViewChild,
    ComponentFactoryResolver,
    OnDestroy,
    ElementRef
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { IvrService } from '@services/ivr.service';
import { MessageServices } from '@services/message.services';
import { IvrItem, IvrLevel, IvrLevelBase, Digit } from '@models/ivr.model';
import { FadeAnimation } from '@shared/fade-animation';
import { StorageService } from '@services/storage.service';
import { HostIvrFormDirective } from './directive/host.directive';
import { IvrFormInterface } from './form.interface';
import { IvrDigitFormComponent } from './ivr-digit-form/ivr-digit-form';
import { IvrLevelFormComponent } from './ivr-level-form/ivr-level-form';
import * as _ from 'lodash';
import { numberRangeValidator } from '@shared/encry-form-validators';

@Component({
    selector: 'pbx-ivr-create',
    templateUrl: './ivr-create.component.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')],
    providers: [StorageService]
})
export class IvrCreateComponent implements OnInit {
    ivrLevels: Array<IvrLevel> = []; // all levels
    currentLevel: IvrLevel;
    currentDigit: Digit;
    isValidForm = false;
    ref = {
        sip: [],
        params: [],
        usedDiget: [],
        sipId: 0,
        levels: []
    };
    ivrData: any;
    id: number;
    loading: number;
    sipOuters: any;
    modelFromServer: IvrItem;
    formChangeSubscription: Subscription;
    forms = {
        levelForm: IvrLevelFormComponent,
        digits: IvrDigitFormComponent
    };
    @ViewChild(HostIvrFormDirective) hostIvr: HostIvrFormDirective;
    @ViewChild('levelPanel', { read: ElementRef }) panel: ElementRef;
    currentForm: IvrFormInterface;

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
        this.service.initReferences().then(() => {
            if (this.id) {
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
    }

    getItem(id) {
        this.loading++;
        this.service
            .getById(id)
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
        this.loadForm(this.forms.levelForm, newLevel);
    }

    loadForm(form, data) {
        this.ref.sipId = this.modelFromServer.sipId;
        this.service.currentSip = this.modelFromServer.sipId;
        if (this.formChangeSubscription) {
            this.formChangeSubscription.unsubscribe();
        }
        if (data instanceof IvrLevel) {
            this.currentLevel = data;
            this.currentDigit = undefined;
        } else {
            if (this.currentLevel) {
                this.ref.usedDiget = this.currentLevel.digits.map(d => d.digit);
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
            this.currentDigit.name = form.value.name;
            this.currentDigit.parameter = form.value.parameter;
        } else {
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
        } catch (error) {
            console.error(error);
        }
    }

    convertIvrLevelsToIverItems(ivr: IvrLevel[]) {
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
                        name: '',
                        loop: 1
                    },
                    {
                        level: i.levelNum,
                        waitTime: 5,
                        digit: 'timeout',
                        action: i.action,
                        parameter: i.parameter,
                        description: i.description,
                        name: '',
                        loop: 1
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

    save() {
        const levelIndex = this.ivrLevels.findIndex(
            x => x.levelNum === this.currentLevel.levelNum
        );
        if (levelIndex !== -1) {
            this.ivrLevels[levelIndex] = this.currentLevel;
        } else {
            this.ivrLevels.push(this.currentLevel);
        }
        const data = this.convertIvrLevelsToIverItems(this.ivrLevels);
        if (this.id) {
            this.service.edit(this.id, data).then(res => {
                this.initExistsIvr(res);
            });
        } else {
            this.service.save(data).then(res => {
                if (!this.id) {
                    this.id = res.id;
                    this.router.navigate([`cabinet/ivr/${res.id}`]);
                }
            });
        }

        this.ref.levels = this.ivrLevels;
    }

    saveDigit(d: Digit) {
        const idx = this.currentLevel.digits.findIndex(
            x => x === this.currentDigit
        );
        this.currentLevel.digits[idx] = d;
        this.currentDigit = d;
    }

    onIvrLevelSelected(e) {
        this.loadForm(this.forms.levelForm, e);
        const levelIndex = this.ivrLevels.findIndex(
            x => x.levelNum === this.currentLevel.levelNum
        );
        if (levelIndex !== -1) {
            this.ivrLevels[levelIndex] = this.currentLevel;
        } else {
            this.ivrLevels.push(this.currentLevel);
        }
        this.currentLevel = e;
        this.ref.levels = this.ivrLevels;
        this.ivrLevels.forEach(l => {
            if (l.levelNum > e.levelNum) {
                l.isVisible = false;
            }
        });
    }

    onIvrDigitSelected(e) {
        this.visibleOrHideDigit(e);
        this.loadForm(this.forms.digits, e);
        this.currentDigit = e;
    }

    visibleOrHideDigit(digit) {
        const curDigit = this.currentDigit;
        if (curDigit && curDigit.action && curDigit.action.toString() === '7') {
            const currVisibledLevel = this.ivrLevels.find(
                x => x.levelNum.toString() === curDigit.parameter.toString()
            );
            if (currVisibledLevel) {
                currVisibledLevel.isVisible = false;
            }
        }
        if (digit.action && digit.action.toString() === '7') {
            const nextIvr = this.ivrLevels.find(
                x => x.levelNum.toString() === digit.parameter.toString()
            );
            nextIvr.isVisible = true;
        }
    }

    addLevel(l) {
        l.levelNum = this.ivrLevels.length + 1;
        this.currentDigit.parameter = l.levelNum;
        l.isVisible = true;
        this.panel.nativeElement.scrollLeft += 500;
        this.onIvrLevelSelected(l);
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
            this.onIvrDigitSelected(curDigit);
        } else {
            this.onIvrLevelSelected(this.currentLevel);
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

    cancelEdit(e) {
        console.log(e);
        if (this.currentDigit) {
            this.deleteDigit();
        } else {
            this.deleteLevel(this.currentLevel);
        }
    }

    getVisibleLevels() {
        return this.ivrLevels.filter(x => x.isVisible || x.levelNum === 1);
    }
}
