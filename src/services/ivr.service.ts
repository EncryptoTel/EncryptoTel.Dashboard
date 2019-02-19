import { plainToClass } from 'class-transformer';
import { Validators } from '@angular/forms';

import { BaseService } from '@services/base.service';
import {
    IvrItem,
    IvrModel,
    IvrTreeItem,
    DigitActions,
    IvrLevel,
    Digit,
    MAX_IVR_LEVEL_COUNT
} from '@models/ivr.model';
import { PageInfoModel } from '@models/base.model';
import { addressPhoneRegExp } from '@shared/vars';
import {PhoneNumberItem, PhoneNumberModel} from '@models/phone-number.model';

export class IvrService extends BaseService {
    pageInfo: IvrModel = new IvrModel();
    item: IvrItem;
    references: any = {};
    currentSip: any;

    reset() {
        this.item = new IvrItem();
    }

    getById(id: number): Promise<IvrItem> {
        return super.getById(id).then((res: IvrItem) => {
            this.item = plainToClass(IvrItem, res);
            this.item.sipId = this.item.sip.id;
            return Promise.resolve(this.item);
        });
    }

    edit(id: number, data): Promise<any> {
        return this.put(`/${id}`, data);
    }

    save(data): Promise<any> {
        return this.post('', data);
    }

    getItems(pageInfo: PageInfoModel, filter = null, sort = null): Promise<IvrModel> {
        return super.getItems(pageInfo, filter, sort).then((response: IvrModel) => {
            this.pageInfo = this.plainToClassEx(IvrModel, IvrItem, response);
            if (this.pageInfo.items) {
                this.pageInfo.items.forEach(item => {
                    item.status = item.enabled ? 1 : 0;
                });
            }
            return Promise.resolve(this.pageInfo);
        });
    }

    getExtensions(id: number): Promise<any> {
        return this.request.get(`v1/ivr/inners?sipOuter=${id}`);
    }

    onInit() {
        this.url = 'ivr';
    }

    getFiles() {
        return this.request.get('v1/account/file?type=audio');
    }

    getParams(): Promise<any> {
        return this.request.get(`v1/ivr/params`);
    }

    getQueue() {
        return this.request.get(`v1/ivr/call-queue`);
    }

    getRingGroup() {
        return this.request.get(`v1/ivr/ring-group`);
    }

    getSipOuters() {
        return this.request.get(`v1/ivr/outers`);
    }

    initReferences() {
        return Promise.all([
            this.getSipOuters(),
            this.getParams(),
            this.getQueue(),
            this.getRingGroup(),
            this.initFiles()
        ]).then(res => {
            this.references.sip = !!res[0].items ? res[0].items : [];
            this.references.sip.map(item => {
                if (item.providerId !== 1) {
                    item.phoneNumber = `+${item.phoneNumber}`;
                }
            });
            const action = res[1].actions;
            this.references.params = Object.keys(action).map(val => {
                return { id: val, code: action[val] };
            });
            this.references.levelParams = this.references.params.filter(
                p => p.id !== DigitActions.GO_TO_LEVEL
            );
            this.references.queue = res[2].items;
            this.references.ringGroup = res[3].items;
        });
    }

    initFiles() {
        return this.getFiles()
            .then(response => {
                this.references.files = response.items;
            })
            .catch(() => { });
    }

    showParameter(action, sipId, levels, data: IvrLevel | Digit): any {
        const paramsInfo = {
            label: '',
            option: [],
            visible: true,
            validators: [],
            validationMessage: [],
            autoComplete: false
        };

        let lastLevel: boolean = false;
        if (data instanceof IvrLevel) {
            lastLevel = data.levelNum === MAX_IVR_LEVEL_COUNT;
        } else {
            const level = levels.find(l =>
                l.digits.some(d => d.id === data.id)
            );
            if (level) {
                lastLevel = level.levelNum === MAX_IVR_LEVEL_COUNT;
            }
        }

        return new Promise((resolve, reject) => {
            switch (action.toString()) {
                case DigitActions.REDIRECT_TO_EXT:
                    const sip = this.references.sip.find(x => x.id === sipId);
                    paramsInfo.option = sip
                        ? sip.sipInners.map(x => {
                            return { id: x.id, name: x.phoneNumber };
                        })
                        : [];
                    paramsInfo.label = 'Extension number';
                    paramsInfo.visible = true;
                    paramsInfo.validators = [Validators.required];
                    paramsInfo.validationMessage.push(
                        {
                            key: 'parameter',
                            error: 'required',
                            message:
                                this.translate.instant('Extension number is required')
                        },
                    );
                    resolve(paramsInfo);
                    break;
                case DigitActions.REDIRECT_TO_NUM:
                    paramsInfo.label = 'External number';
                    paramsInfo.option = this.references.sip.map(s => {
                        return { id: s.id, name: s.phoneNumber };
                    });
                    paramsInfo.visible = true;
                    paramsInfo.autoComplete = true;
                    paramsInfo.validators = [
                        Validators.required,
                        Validators.minLength(6),
                        Validators.maxLength(16),
                        Validators.pattern(addressPhoneRegExp)
                    ];
                    paramsInfo.validationMessage.push(
                        {
                            key: 'parameter',
                            error: 'required',
                            message:
                                this.translate.instant('Extension number is required')
                        },
                        {
                            key: 'parameter',
                            error: 'maxlength',
                            message:
                                this.translate.instant('External number is too long. Use no more than 16 numbers')
                        },
                        {
                            key: 'parameter',
                            error: 'minlength',
                            message:
                                this.translate.instant('External number is too short. Use at least 6 numbers')
                        },
                        {
                            key: 'parameter',
                            error: 'pattern',
                            message:
                                this.translate.instant('External number contains invalid characters. You can use numbers only')
                        },
                    );
                    resolve(paramsInfo);
                    break;
                case DigitActions.REDIRECT_TO_QUEUE:
                    paramsInfo.label = 'Queue';
                    paramsInfo.option = this.references.queue.map(x => {
                        return { id: x.id, name: x.name };
                    });
                    paramsInfo.visible = true;
                    paramsInfo.validators = [Validators.required];
                    paramsInfo.validationMessage.push(
                        {
                            key: 'parameter',
                            error: 'required',
                            message:
                                this.translate.instant('Queue is required')
                        }
                    );
                    resolve(paramsInfo);
                    break;
                case DigitActions.REDIRECT_TO_RING_GROUP:
                    paramsInfo.label = 'Ring Group';
                    paramsInfo.option = this.references.ringGroup.map(x => {
                        return { id: x.id, name: x.name };
                    });
                    paramsInfo.visible = true;
                    paramsInfo.validators = [Validators.required];
                    paramsInfo.validationMessage.push(
                        {
                            key: 'parameter',
                            error: 'required',
                            message:
                                this.translate.instant('Ring Group is required')
                        }
                    );
                    resolve(paramsInfo);

                    break;
                case DigitActions.CANCEL_CALL:
                    paramsInfo.label = 'Cancel call';
                    paramsInfo.option = undefined;
                    paramsInfo.visible = false;
                    resolve(paramsInfo);
                    break;
                case DigitActions.GO_TO_LEVEL:
                    paramsInfo.label = 'Level';
                    paramsInfo.option = levels.map(l => {
                        return { id: l.levelNum, name: l.name };
                    });
                    if (!lastLevel) {
                        paramsInfo.option.push({
                            id: -1,
                            name: 'new level'
                        });
                    }
                    paramsInfo.visible = true;
                    paramsInfo.validators = [Validators.required];
                    paramsInfo.validationMessage.push(
                        {
                            key: 'parameter',
                            error: 'required',
                            message:
                                this.translate.instant('Level is required')
                        }
                    );
                    resolve(paramsInfo);
                    break;
                case DigitActions.REPEAT_LEVEL:
                    paramsInfo.label = 'Ivr repeat level';
                    paramsInfo.option = undefined;
                    paramsInfo.visible = false;
                    resolve(paramsInfo);
                    break;
                case DigitActions.REDIRECT_TO_INTEGRATION:
                    paramsInfo.label = 'Ivr integration';
                    paramsInfo.option = undefined;
                    paramsInfo.visible = false;
                    resolve(paramsInfo);
                    break;
                case DigitActions.PLAY_VOICE:
                    paramsInfo.label = 'Play file';
                    paramsInfo.option = this.references.files.map(file => {
                        return { id: file.id, name: file.fileName };
                    });
                    paramsInfo.validators = [Validators.required];
                    paramsInfo.validationMessage.push(
                        {
                            key: 'parameter',
                            error: 'required',
                            message:
                                this.translate.instant('Play file is required')
                        }
                    );
                    paramsInfo.visible = true;
                    resolve(paramsInfo);
                    break;
                default:
                    reject();
                    break;
            }
        });
    }
}
