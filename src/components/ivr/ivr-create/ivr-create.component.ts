import { Component, OnInit, ViewChild, ComponentFactoryResolver } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { IvrService } from '@services/ivr.service';
import { RefsServices } from '@services/refs.services';
import { MessageServices } from '@services/message.services';
import { IvrItem, IvrLevel, IvrLevelBase, Digit } from '@models/ivr.model';
import { FadeAnimation } from '@shared/fade-animation';
import { StorageService } from '@services/storage.service';
import { HostIvrFormDirective } from './directive/host.directive';
import { IvrFormInterface } from './form.interface';
import { IvrDigitFormComponent } from './ivr-digit-form/ivr-digit-form';
import { IvrLevelFormComponent } from './ivr-level-form/ivr-level-form';
import * as _ from 'lodash';

export enum DigitActions {
    EXTENSION_NUMBER = 1,
    EXTERNAL_NUMBER = 2,
    SEND_TO_IVR = 3
}

@Component({
    selector: 'pbx-ivr-create',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')],
    providers: [StorageService]
})
export class IvrCreateComponent implements OnInit {
    ivrLevels: Array<IvrLevel> = []; // all levels
    ivrViewLevels = []; // levels shows for user
    currentLevel: IvrLevel;
    currentDigit: Digit;
    ref = {
        sip: [],
        params: [],
        usedDiget: [],
        sipId: 0
    };
    ivrData: any;
    id: number;
    loading: number;
    sipOuters: any;
    modelFromServer: IvrItem;
    forms = {
        levelForm: IvrLevelFormComponent,
        digits: IvrDigitFormComponent
    };
    @ViewChild(HostIvrFormDirective) hostIvr: HostIvrFormDirective;
    currentForm: IvrFormInterface;
    isValidForm = false;
    isLevelVisible = false;
    constructor(public service: IvrService,
        protected message: MessageServices,
        private componentFactoryResolver: ComponentFactoryResolver,
        private refs: RefsServices,
        private activatedRoute: ActivatedRoute,
        private storage: StorageService,
        private router: Router, ) {

        this.id = this.activatedRoute.snapshot.params.id;

    }

    ngOnInit(): void {
        this.loadRefs().then(() => {
            if (this.id) {
                this.getItem(this.id);
            } else {
                this.initEmptyModel();
            }
        });
    }

    loadRefs() {
        this.loading++;
        return Promise.all([
            // this.service.getParams(),
            this.refs.getSipOuters()
        ]).then(res => {
            // this.ref.params = res[0];
            this.ref.sip = res[1];
        })
    }

    initExistsIvr(val) {
        this.modelFromServer = val;
        this.ivrLevels = this.convertIvrItems(this.modelFromServer);
        if (this.ivrLevels.length > 0) {
            this.isLevelVisible = true;
            this.ivrViewLevels.push(this.ivrLevels[0]);
            this.loadForm(this.forms.levelForm, this.ivrLevels[0]);
        }
    }

    getItem(id) {
        this.loading++;
        this.service.getById(id).then((val) => {
            this.initExistsIvr(val);

        }).catch(() => {
        }).then(() => this.loading--);
    }

    initEmptyModel() {
        this.modelFromServer = new IvrItem();
        const newLevel = new IvrLevel();
        newLevel.levelNum = 1;
        this.loadForm(this.forms.levelForm, newLevel);
    }

    loadForm(form, data) {
        this.ref.sipId = this.modelFromServer.sipId;
        if (data instanceof IvrLevel) {
            this.currentLevel = data;
            this.currentDigit = undefined;
        } else {
            if (this.currentLevel) {
                this.ref.usedDiget = this.currentLevel.digits.map((d) => d.digit);
            }
            this.currentDigit = data;
        }
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(form);
        let viewContainerRef = this.hostIvr.viewContainerRef;
        viewContainerRef.clear();

        let componentRef = viewContainerRef.createComponent(componentFactory);
        this.currentForm = (<IvrFormInterface>componentRef.instance);
        this.currentForm.data = data;
        this.currentForm.isValidForm = (t) => { this.isValidForm = t };
        this.currentForm.references = this.ref;
        this.currentForm.onDelete = (d) => { this.deleteDigit(d) };
        componentRef.changeDetectorRef.detectChanges();
    }

    convertIvrItems(ivr: IvrItem) {
        try {
            const result = _(ivr.tree).groupBy(x => x.level).map((val, key) => {
                return new IvrLevel(val, ivr);
            }).value();
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
                tree: [{
                    level: i.levelNum,
                    waitTime: 5,
                    digit: "intro",
                    action: 5,
                    parameter: i.voiceGreeting,
                    description: i.description,
                    name: ''
                }, {
                    level: i.levelNum,
                    waitTime: 5,
                    digit: "timeout",
                    action: i.action,
                    parameter: i.parameter,
                    description: i.description,
                    name: ''
                }]
            }
            i.digits.forEach(d => {
                result.tree.push({
                    level: i.levelNum,
                    waitTime: 5,
                    digit: d.digit,
                    action: d.action,
                    parameter: d.parameter,
                    description: d.description,
                    name: d.name
                })
            })
            return result;
        });
        return data[0];
    }

    save() {
        const formData = this.currentForm.getData();
        if (formData) {
            if (this.currentForm instanceof IvrDigitFormComponent) {
                this.saveDigit(formData);
            } else {
                this.saveLevel(formData);
            }
            // this.ivrLevels.push(formData);
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
        }
    }

    saveDigit(d: Digit) {
        let exist = this.currentLevel.digits.find(x => x.digit === d.digit);
        if (exist) {
            exist = d;
        } else {
            this.currentLevel.digits.push(d);
        }
    }

    saveLevel(level: IvrLevel) {
        if (!level.levelNum) {
            level.levelNum = this.ivrLevels.length + 1;
            level.digits = [];
            this.ivrLevels.push(level);
        } else {
            let exists = this.ivrLevels.findIndex(x => x.levelNum === level.levelNum);
            if (exists !== -1) {
                level.digits = this.ivrLevels[exists].digits;
                this.ivrLevels[exists] = level;
            } else {
                level.digits = [];
                this.ivrLevels.push(level);
            }
        }

    }

    onIvrLevelSelected(e) {
        this.loadForm(this.forms.levelForm, e);
    }

    onIvrDigitSelected(e) {
        this.loadForm(this.forms.digits, e);
    }

    deleteDigit(d) {
        if (d.digit) {
            this.currentLevel.digits = this.currentLevel.digits.filter(x => x.digit !== d.digit);
        } else {
            this.currentLevel.digits = this.currentLevel.digits.filter(x => !x.digit);
        }
        const data = this.convertIvrLevelsToIverItems(this.ivrLevels);
        this.service.save(data).then(res => {
            this.initExistsIvr(res);
            if (!this.id) {
                this.id = res.id;
                this.router.navigate([`cabinet/ivr/${res.id}`]);
            }
        });
    }

}
