import { Subject } from 'rxjs/Subject';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import {
    FormBuilder,
    Validators,
    FormGroup,
    FormControl,
    ValidationErrors
} from '@angular/forms';

import { IvrService } from '@services/ivr.service';
import { RefsServices } from '@services/refs.services';
import { MessageServices } from '@services/message.services';
import { IvrLevel } from '@models/ivr.model';
import {
    CallRuleDay,
    CallRuleTimeType,
    CallRuleTime
} from '@models/call-rules.model';
import { FormBaseComponent } from '@elements/pbx-form-base-component/pbx-form-base-component.component';
import { FadeAnimation } from '@shared/fade-animation';
import { nameRegExp, phoneRegExp } from '@shared/vars';
import { MediaPlayerComponent } from '@elements/pbx-media-player/pbx-media-player.component';
import { StorageService } from '@services/storage.service';
import { MediaState, CdrMediaInfo } from '@models/cdr.model';
import { IvrFormInterface } from '../form.interface';
import { validateFormControls } from '@shared/shared.functions';

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
            {name: 'External number', error: 'pattern', message: 'Phone number contains invalid characters. You can only use numbers.'},
        ];
    }

    getData() {
        return this.validateForms() ? this.form.value : null;
    }

    ngOnInit() {
        this.initFiles();
        super.ngOnInit();
        this.service.reset();
        this.form.patchValue(this.data);
    }

    initFiles() {
        this.loading ++;
        return this.service.getFiles()
            .then(response => {
                this.files = response.items;
            })
            .catch(() => {})
            .then(() => this.loading --);
    }

    initForm(): void {
        this.form = this.fb.group({
            sipId: [
                null,
                this.data.levelNum === 1 ? [Validators.required] : []
            ],
            name: ['', [Validators.required, Validators.pattern(nameRegExp)]],
            description: ['', [Validators.maxLength(255)]],
            voiceGreeting: [null, [Validators.required]],
            loopMessage: [
                2,
                [Validators.required, Validators.pattern('[0-9]*')]
            ],
            action: [null],
            enabled: [null],
            parameter: [null],
            levelNum: [null]
        });
        
        this.form.statusChanges.subscribe(() => {
            this.onFormChange.next(this.form);
        });
        
        this.form.get('action').valueChanges.subscribe(val => {
            this.loading ++;
            this.service
                .showParameter(
                    val,
                    this.form.value.sipId || this.data.sipId,
                    this.references.levels
                )
                .then(response => {
                    this.paramsInfo = response;
                    this.form.get('parameter').setValidators(this.paramsInfo.validators)
                    this.form.get('parameter').setValue(null);
                    this.validationHost.initItems();
                })
                .catch(() => {})
                .then(() => this.loading --);
        });
        
        this.form.get('sipId').valueChanges.subscribe(val => {
            this.references.sipId = val;
            this.service.currentSip = val;
        });
        
        this.form.get('voiceGreeting').valueChanges.subscribe(val => {
            this.selectFile(val);
        });
        
        this.addForm(this.formKey, this.form);
    }

    isFileSelected(): boolean {
        if (!this.form.value.voiceGreeting) return false;

        const file = this.files.find(f => f.id === this.form.value.voiceGreeting);
        return !!file
            && file.converted != undefined
            && file.converted > 0;
}

    uploadFile(event: any): void {
        event.preventDefault();

        const file = event.target.files[0];
        if (file) {
            if (this.storage.checkCompatibleType(file)) {
                this.storage.checkFileExists(file, loading => {
                    if (!this.storage.loading) {
                        this.initFiles();
                    }
                });
            } else {
                this.message.writeError('Accepted formats: mp3, ogg, wav');
            }
            this.storage.checkModal();
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
