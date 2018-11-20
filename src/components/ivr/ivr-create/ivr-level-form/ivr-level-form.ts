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
import { nullSafeIsEquivalent } from '@angular/compiler/src/output/output_ast';

export enum DigitActions {
    EXTENSION_NUMBER = 1,
    EXTERNAL_NUMBER = 2,
    SEND_TO_IVR = 3
}

@Component({
    selector: 'pbx-ivr-level-form',
    templateUrl: './ivr-level-form.html',
    styleUrls: ['./ivr-level-form.sass'],
    animations: [FadeAnimation('300ms')],
    providers: [StorageService]
})
export class IvrLevelFormComponent extends FormBaseComponent
    implements OnInit, IvrFormInterface {
    onFormChange: Subject<any>;
    onDelete: Function;
    references: any;
    data: IvrLevel;
    actionVal: 0;
    loading: number = 0;
    sipOuters: any;
    bsRangeValue = new Date();
    callRuleTimeDays = CallRuleDay.fromPlain([
        { type: 'accent', day: 'Mon', code: 'mon' },
        { type: 'accent', day: 'Tue', code: 'tue' },
        { type: 'accent', day: 'Wed', code: 'wed' },
        { type: 'accent', day: 'Thu', code: 'thu' },
        { type: 'accent', day: 'Fri', code: 'fri' },
        { type: 'cancel', day: 'Sat', code: 'sat' },
        { type: 'cancel', day: 'Sun', code: 'sun' }
    ]);
    sipInners: any;
    durationTimes = CallRuleTimeType.fromPlain([
        { id: 1, code: 'Always (24 hours)' },
        { id: 2, code: 'Set the time' }
    ]);

    callRuleTimes = CallRuleTime.fromPlain([
        { time: '12:00 a.m', asteriskTime: '00:00' },
        { time: '1:00 a.m', asteriskTime: '01:00' },
        { time: '2:00 a.m', asteriskTime: '02:00' },
        { time: '3:00 a.m', asteriskTime: '03:00' },
        { time: '4:00 a.m', asteriskTime: '04:00' },
        { time: '5:00 a.m', asteriskTime: '05:00' },
        { time: '6:00 a.m', asteriskTime: '06:00' },
        { time: '7:00 a.m', asteriskTime: '07:00' },
        { time: '8:00 a.m', asteriskTime: '08:00' },
        { time: '9:00 a.m', asteriskTime: '09:00' },
        { time: '10:00 a.m', asteriskTime: '10:00' },
        { time: '11:00 a.m', asteriskTime: '11:00' },
        { time: '12:00 p.m', asteriskTime: '12:00' },
        { time: '1:00 p.m', asteriskTime: '13:00' },
        { time: '2:00 p.m', asteriskTime: '14:00' },
        { time: '3:00 p.m', asteriskTime: '15:00' },
        { time: '4:00 p.m', asteriskTime: '16:00' },
        { time: '5:00 p.m', asteriskTime: '17:00' },
        { time: '6:00 p.m', asteriskTime: '18:00' },
        { time: '7:00 p.m', asteriskTime: '19:00' },
        { time: '8:00 p.m', asteriskTime: '20:00' },
        { time: '9:00 p.m', asteriskTime: '21:00' },
        { time: '10:00 p.m', asteriskTime: '22:00' },
        { time: '11:00 p.m', asteriskTime: '23:00' }
    ]);
    then_data = [
        { id: 1, code: 'Redirect to extension number' },
        { id: 2, code: 'Redirect to external number' },
        { id: 3, code: 'Create new level' }
    ];
    selectedDurationTimeRange = [this.callRuleTimes[9], this.callRuleTimes[18]];
    currentMediaStream: string;
    playButtonText: string;
    selectedFiles = [];
    files = [];
    ruleFor = [
        { id: 1, name: 'Allways' },
        { id: 2, name: 'Date (period)' },
        { id: 3, name: 'Day of the week' }
    ];
    period: any;
    @ViewChild('mediaPlayer') mediaPlayer: MediaPlayerComponent;

    rule_value_visible = 0;
    timeVisible = false;
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
    }

    getData() {
        if (this.form.valid) {
            return this.form.value;
        } else {
            validateFormControls(this.form);
        }
        this.validationHost.clearControlsFocusedState();
        return null;
    }

    ngOnInit() {
        this.loading++;
        super.ngOnInit();
        this.service.reset();
        Promise.all([this.initFiles(), this.getSipOuters()]).then(() => {
            this.then_data = this.references.params;
            this.loading--;
            this.form.patchValue(this.data);
        });
    }

    initFiles() {
        return this.service.getFiles().then(res => {
            this.files = res.items;
            console.log('fileLoaded');
        });
    }

    initForm(): void {
        this.form = this.fb.group({
            sipId: [null, [Validators.required]],
            name: ['', [Validators.required, Validators.pattern(nameRegExp)]],
            description: ['', [Validators.maxLength(255)]],
            voiceGreeting: [null, [Validators.required]],
            loopMessage: [
                2,
                [Validators.required, Validators.pattern('[0-9]*')]
            ],
            // rule_for: [null],
            // rule_value: [null],
            // duration_time: [null],
            // duration: [null],
            action: [null],
            enabled: [null],
            parameter: [null],
            levelNum: [null]
        });
        this.form.statusChanges.subscribe(() => {
            this.onFormChange.next(this.form);
        });
        this.form.get('action').valueChanges.subscribe(val => {
            this.showParameter(val);
        });
        this.form.get('sipId').valueChanges.subscribe(val => {
            this.references.sipId = val;
        });

        // this.form.get("duration_time").valueChanges.subscribe(val => {
        //     this.timeVisible = (val === 2);
        // });
        this.addForm(this.formKey, this.form);
    }

    isFileSelected(index: number): boolean {
        return !!this.selectedFiles[index];
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

    selectFile(index: number, file: any): void {
        if (
            this.mediaPlayer.selectedMediaId !== file.id &&
            this.mediaPlayer.state === MediaState.PLAYING
        ) {
            this.mediaPlayer.stopPlay();
        }
        this.selectedFiles[index] = file;
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

        this.storage
            .getMediaData(fileId)
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

    selectTime(val, idx) {
        this.selectedDurationTimeRange[idx] = val;
    }

    getSipOuters() {
        this.loading++;
        return this.refs
            .getSipOuters()
            .then(response => {
                this.sipOuters = response;
                console.log('SipOuters loaded');
            })
            .catch(() => {})
            .then(() => this.loading--);
    }

    getExtensions(id: number): void {
        this.loading++;
        this.service
            .getExtensions(id)
            .then(response => {
                this.sipInners = response.items;
            })
            .catch(() => {})
            .then(() => this.loading--);
    }

    showParameter(val) {
        switch (val) {
            case DigitActions.EXTENSION_NUMBER:
                this.getExtensions(this.references.sipId);
                break;
            case DigitActions.EXTERNAL_NUMBER:
                this.sipInners = [];
                break;
            case DigitActions.SEND_TO_IVR:
                break;
        }
        this.actionVal = val;
    }
}
