import { Subject } from 'rxjs/Subject';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import {
    FormBuilder,
    Validators
} from '@angular/forms';

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

@Component({
    selector: 'pbx-ivr-level-form',
    templateUrl: './ivr-level-form.html',
    styleUrls: ['./ivr-level-form.sass'],
    animations: [FadeAnimation('300ms')],
    providers: [StorageService]
})
export class IvrLevelFormComponent extends FormBaseComponent
    implements OnInit, IvrFormInterface {
    onAddLevel: Function;
    onFormChange: Subject<any>;
    onDelete: Function;
    references: any;
    data: IvrLevel;
    actionVal: 0;
    loading: number = 0;
    sipOuters: any;
    bsRangeValue = new Date();
    currentMediaStream: string = '/assets/mp3/silence.mp3';
    playButtonText: string;
    files = [];

    period: any;
    @ViewChild('mediaPlayer') mediaPlayer: MediaPlayerComponent;

    rule_value_visible = 0;
    timeVisible = false;
    paramsInfo = {
        label: '',
        option: [],
        visible: false,
        validators: [],
    };

    // -- properties ----------------------------------------------------------

    get valid(): boolean {
        return this.form.valid;
    }

    get paramsPlaceholder(): string {
        const placeholder: string = (Array.isArray(this.paramsInfo.option) && this.paramsInfo.option.length === 0)
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
        private storage: StorageService
    ) {
        super(fb, message);
        this.onFormChange = new Subject();

        this.validationHost.customMessages = [
            { name: 'External number', error: 'pattern', message: 'Phone number contains invalid characters. You can only use numbers.' },
            { name: 'Loop message', error: 'pattern', message: 'Loop message value should be from 1 to 5.' },
            { name: 'IVR Name', error: 'pattern', message: 'IVR Name may contain letters, digits, dots and dashes only.' },
            { name: 'Level Name', error: 'pattern', message: 'Level Name may contain letters, digits, dots and dashes only.' },
        ];
    }

    getData() {
        return this.validateForms() ? this.form.value : null;
    }

    ngOnInit() {
        this.initFiles();
        super.ngOnInit();
        this.service.reset();

        if (!this.data.action) {
            this.data.action = DigitActions.CANCEL_CALL;
        }

        this.setFormData(this.data);
    }

    initFiles() {
        this.loading++;
        return this.service.getFiles()
            .then(response => {
                this.files = response.items;
            })
            .catch(() => { })
            .then(() => this.loading--);
    }

    initForm(): void {
        this.form = this.fb.group({
            sipId: [
                null,
                this.data.levelNum === 1 ? [Validators.required] : []
            ],
            name: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(40), Validators.pattern(ivrNameRegExp)]],
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
                    this.form.get('parameter').setValidators(this.paramsInfo.validators)
                    if (actionValue !== this.data.action) {
                        this.form.get('parameter').setValue(null);
                    }
                    this.form.get('parameter').markAsUntouched();
                    this.validationHost.initItems();
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
            console.log(val);
            this.selectFile(val);
        });
    }

    get isFileSelected(): boolean {
        if (!this.form.value.voiceGreeting) return false;

        const file = this.files.find(f => +f.id === +this.form.value.voiceGreeting);
        return !!file
            && file.converted != undefined
            && file.converted > 0;
    }

    uploadFile(event: any): void {
        event.preventDefault();
        const file = event.target.files[0];
        if (file) {
            if (this.storage.checkCompatibleType(file)) {
                this.storage.checkOnlyFileExists(file).then((res) => {
                    if (!res) {
                        this.storage.uploadFile(file, null).then(f => {
                            this.initFiles().then(() => {
                                this.selectVoiceGreeting(f);
                            });
                        })
                    } else {
                        const f = this.files.find(f => f.fileName === file.name);
                        this.selectVoiceGreeting(f);
                    }
                })
            } else {
                this.message.writeError('Accepted formats: mp3, ogg, wav');
            }
            this.storage.checkModal();
        }
    }

    selectVoiceGreeting(file) {
        if (file) {
            this.form.get('voiceGreeting').setValue(file.id);
            this.form.get('name').setValue(file.id);
            // this.form.value.voiceGreeting = file.id;
            this.files = this.files.slice();
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

    togglePlay(i: number): void {
        const fileId = this.form.value.voiceGreeting;
        if (fileId) {
            this.mediaPlayer.togglePlay(fileId);
        }
    }

    stopPlayerPlay(): void {
        this.mediaPlayer.stopPlay();
    }

    getMediaData(fileId: number): void {
        this.mediaPlayer.locker.lock();
        this.storage.getMediaData(fileId)
            .then((media: CdrMediaInfo) => {
                this.currentMediaStream = media.fileLink;
            })
            .catch(error => {
                console.log(error);
                // Error handling here ...
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

    selectDay(idx, day) {
        day.type = day.type === 'accent' ? 'cancel' : 'accent';
    }

    visibleElementForRule(val) {
        return this.rule_value_visible === val;
    }
}
