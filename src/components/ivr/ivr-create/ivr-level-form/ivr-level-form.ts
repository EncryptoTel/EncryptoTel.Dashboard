import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { Component, OnInit, ViewChild, Input, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { IvrService } from '@services/ivr.service';
import { RefsServices } from '@services/refs.services';
import { MessageServices } from '@services/message.services';
import { IvrLevel, DigitActions } from '@models/ivr.model';
import { FormBaseComponent } from '@elements/pbx-form-base-component/pbx-form-base-component.component';
import { FadeAnimation } from '@shared/fade-animation';
import { ivrNameRegExp } from '@shared/vars';
import { MediaPlayerComponent } from '@elements/pbx-media-player/pbx-media-player.component';
import { StorageService } from '@services/storage.service';
import { MediaState, CdrMediaInfo } from '@models/cdr.model';
import { IvrFormInterface } from '../form.interface';
import { InputComponent } from '@elements/pbx-input/pbx-input.component';

export enum FormButtons {
    VOICE_GREETING = 'voiceGreeting',
    PLAY_FILE = 'playFile'
}

@Component({
    selector: 'pbx-ivr-level-form',
    templateUrl: './ivr-level-form.html',
    styleUrls: ['./ivr-level-form.sass'],
    animations: [FadeAnimation('300ms')],
    providers: [StorageService]
})
export class IvrLevelFormComponent extends FormBaseComponent
    implements OnInit, IvrFormInterface, OnDestroy {
    onAddLevel: Function;
    onFormChange: Subject<any>;
    onDelete: Function;
    references: any;
    data: IvrLevel;
    actionVal: 0;
    formPatched = false;
    loading: number = 0;
    sipOuters: any;
    bsRangeValue = new Date();
    currentMediaStream: string = '/assets/mp3/silence.mp3';
    playButtonText: string;
    currentButton: FormButtons;
    currentUploadButton: FormButtons;
    period: any;
    @ViewChild('mediaPlayer') mediaPlayer: MediaPlayerComponent;
    @ViewChild('voiceGreeting') voiceGreeting: InputComponent;
    @ViewChild('actionData') actionData: InputComponent;
    rule_value_visible = 0;
    timeVisible = false;
    paramsInfo = {
        label: '',
        option: [],
        visible: false,
        validators: [],
        validationMessage: []
    };

    formPanel: Element = null;
    uploadedFile: Subscription;

    selectedMediaControl: FormButtons;

    // -- properties ----------------------------------------------------------

    get valid(): boolean {
        return this.form.valid;
    }

    get paramsPlaceholder(): string {
        const placeholder: string =
            Array.isArray(this.paramsInfo.option) &&
                this.paramsInfo.option.length === 0
                ? 'None'
                : '';
        return placeholder;
    }

    // -- component lifecycle methods -----------------------------------------

    constructor(
        public service: IvrService,
        protected fb: FormBuilder,
        protected message: MessageServices,
        private refs: RefsServices,
        private storage: StorageService,
        protected translate: TranslateService
    ) {
        super(fb, message, translate);
        this.onFormChange = new Subject();

        this.validationHost.customMessages = [
            {
                key: 'parameter',
                error: 'pattern',
                message:
                    this.translate.instant('Phone number contains invalid characters. You can only use numbers.')
            },
            {
                key: 'voiceGreeting',
                error: 'required',
                message:
                    this.translate.instant('Please choose the Voice Greeting.')
            },
            {
                key: 'loopMessage',
                error: 'pattern',
                message: this.translate.instant('Loop message value should be from 1 to 5.')
            },
            {
                key: 'name',
                error: 'pattern',
                message:
                    this.translate.instant('IVR Name may contain letters, digits, dots and dashes only.')
            },
            {
                key: 'name',
                error: 'pattern',
                message:
                    this.translate.instant('Level Name may contain letters, digits, dots and dashes only.')
            },
            {
              key: 'sipId',
              error: 'required',
              message:
                  this.translate.instant('Please choose the Phone Number')
          }
      ];
    }

    getData() {
        return this.validateForms() ? this.form.value : null;
    }

    ngOnInit() {
        super.ngOnInit();
        this.service.reset();

        if (!this.data.action) {
            this.data.action = DigitActions.CANCEL_CALL;
        }

        this.uploadedFile = this.storage.uploadedFile.subscribe(f => {
            this.service.getFiles().then(res => {
                this.service.references.files = res.items;
                if (this.currentUploadButton === FormButtons.VOICE_GREETING) {
                    if (f) {
                        this.voiceGreeting.value = f;
                        this.form.get('voiceGreeting').setValue(f.id);
                    }
                } else {
                    if (f) {
                        this.paramsInfo.option = res.items.map(file => {
                            return { id: file.id, name: file.fileName };
                        });
                        const fileData = this.paramsInfo.option.find(
                            x => x.id === f.id
                        );
                        setTimeout(() => {
                            this.actionData.value = fileData;
                            this.form.get('parameter').setValue(f.id);
                        }, 50);
                    }
                }
            });
        });

        this.setFormData(this.data);
    }

    initForm(): void {
        this.form = this.fb.group({
            sipId: [
                null,
                this.data.levelNum === 1 ? [Validators.required] : []
            ],
            name: [
                '',
                [
                    Validators.required,
                    Validators.minLength(4),
                    Validators.maxLength(40),
                    Validators.pattern(ivrNameRegExp)
                ]
            ],
            description: ['', [Validators.maxLength(255)]],
            voiceGreeting: [null, [Validators.required]],
            loopMessage: [
                2,
                [Validators.required, Validators.pattern('[1-5]')]
            ],
            action: [null],
            enabled: [null],
            parameter: [null],
            levelNum: [null]
        });

        this.form.statusChanges.subscribe(() => {
            this.onFormChange.next(this.form);
        });

        this.form.get('action').valueChanges.subscribe(actionValue => {
            this.loading++;
            this.service
                .showParameter(
                    actionValue,
                    this.form.value.sipId || this.data.sipId,
                    this.references.levels,
                    this.data
                )
                .then(response => {
                    this.paramsInfo = response;
                    if (actionValue !== this.actionVal && this.formPatched) {
                        this.form.get('parameter').setValue(null);
                    }
                    this.form
                        .get('parameter')
                        .setValidators(this.paramsInfo.validators);

                    this.form.get('parameter').markAsUntouched();
                    if (this.paramsInfo.validationMessage && this.paramsInfo.validationMessage.length > 0) {
                        this.validationHost.customMessages = this.validationHost.customMessages.filter(x => x.key !== 'parameter');
                        this.validationHost.customMessages.push(...this.paramsInfo.validationMessage);
                    }
                    this.validationHost.initItems();
                    this.actionVal = actionValue;
                })
                .catch(() => { })
                .then(() => this.loading--);
        });

        this.form.get('sipId').valueChanges.subscribe(sipId => {
            if (typeof sipId === 'number') {
                this.references.sipId = sipId;
                this.service.currentSip = sipId;

                this.loading++;
                this.service
                    .showParameter(
                        this.form.get('action').value,
                        sipId,
                        this.references.levels,
                        this.data
                    )
                    .then(response => {
                        this.paramsInfo = response;
                    })
                    .catch(() => { })
                    .then(() => this.loading--);
            }
        });

        this.form.get('voiceGreeting').valueChanges.subscribe(val => {
            this.selectFile(val);
        });

        this.form.get('parameter').valueChanges.subscribe(val => {
            this.selectFile(val);
        });
        setTimeout(() => {
            this.formPatched = true;
        }, 1000);
    }

    isFileSelected(btn: FormButtons): boolean {
        let fileId;
        if (btn === FormButtons.VOICE_GREETING) {
            if (!this.form.value.voiceGreeting) return false;
            fileId = this.form.value.voiceGreeting;
        } else {
            if (!this.form.value.parameter) return false;
            fileId = this.form.value.parameter;
        }
        const file = this.service.references.files.find(f => +f.id === +fileId);
        return !!file && file.converted !== undefined && file.converted > 0;
    }

    uploadFile(event: any, btn: FormButtons): void {
        event.preventDefault();
        this.currentUploadButton = btn;
        const file = event.target.files[0];
        event.target.value = '';
        if (file) {
            if (this.storage.checkCompatibleType(file)) {
                this.storage.checkFileExists(file, loading => { });
            } else {
                this.message.writeError(this.translate.instant('Accepted formats: mp3, ogg, wav'));
            }
            // this.storage.checkModal();
        }
    }

    selectFile(id: any): void {
        if (
            this.mediaPlayer.selectedMediaId !== id &&
            this.mediaPlayer.state === MediaState.PLAYING
        ) {
            this.mediaPlayer.stopPlay();
        }
        this.mediaStateChanged(this.mediaPlayer.state);
    }

    togglePlay(btn: FormButtons): void {
        let fileId;
        this.currentButton = btn;
        if (btn === FormButtons.VOICE_GREETING) {
            fileId = this.form.value.voiceGreeting;
            this.selectedMediaControl = FormButtons.VOICE_GREETING;
        } else {
            fileId = this.form.value.parameter;
            this.selectedMediaControl = FormButtons.PLAY_FILE;
        }
        if (fileId) {
            this.mediaPlayer.togglePlay(fileId);
        }
    }

    stopPlayerPlay(): void {
        this.mediaPlayer.stopPlay();
    }

    getMediaData(fileId: number): void {
        this.mediaPlayer.locker.lock();
        this.storage
            .getMediaData(fileId)
            .then((media: CdrMediaInfo) => {
                this.currentMediaStream = media.fileLink;
            })
            .catch(error => {
                console.log(error);
                // Error handling here ...
                const file = this.service.references.files.find(f => +f.id === +fileId);
                if (file) { file.converted = null; }
                this.mediaStateChanged(MediaState.PAUSED);
                this.mediaPlayer.locker.unlock();
            })
            .then(() => this.mediaPlayer.locker.unlock());
    }

    mediaStateChanged(state: MediaState): void {
        switch (state) {
            case MediaState.LOADING:
                this.playButtonText = 'Loading';
                break;
            case MediaState.PLAYING:
                this.playButtonText = 'Pause';
                break;
            case MediaState.PAUSED:
            default:
                this.playButtonText = 'Play';
                break;
        }
    }

    getPlayButtonText(btn: FormButtons) {
        if (this.currentButton === btn) {
            return this.playButtonText;
        } else {
            return 'Play';
        }
    }

    selectDay(idx, day) {
        day.type = day.type === 'accent' ? 'cancel' : 'accent';
    }

    visibleElementForRule(val) {
        return this.rule_value_visible === val;
    }

    ngOnDestroy(): void {
        this.uploadedFile.unsubscribe();
    }
}
