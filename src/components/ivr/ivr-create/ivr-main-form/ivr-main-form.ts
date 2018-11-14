import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup, ValidationErrors, AbstractControl, ValidatorFn } from '@angular/forms';

import { IvrService } from '@services/ivr.service';
import { RefsServices } from '@services/refs.services';
import { MessageServices } from '@services/message.services';
import { IvrItem, IvrTreeItem, IvrLevelItem } from '@models/ivr.model';
import { SipItem, CallRuleDay, CallRuleTimeType, CallRuleTime } from '@models/call-rules.model';
import { FormBaseComponent } from '@elements/pbx-form-base-component/pbx-form-base-component.component';
import { FadeAnimation } from '@shared/fade-animation';
import { nameRegExp, phoneRegExp } from '@shared/vars';
import { isValidId } from '@shared/shared.functions';
import { MediaPlayerComponent } from '@elements/pbx-media-player/pbx-media-player.component';
import { StorageService } from '@services/storage.service';
import { callRuleTimeValidator, durationTimeValidator } from '@shared/encry-form-validators';
import { MediaState } from '@models/cdr.model';

/**
 * class IvrCreateComponent
 * 
 * Implements IVR create or edit UI, allows to set as base IVR data as build IVR 
 * navigation menu.
 */
@Component({
    selector: 'pbx-ivr-main-form',
    templateUrl: './ivr-main-form.html',
    styleUrls: ['./ivr-main-form.sass'],
    animations: [FadeAnimation('300ms')],
    providers: [StorageService]
})
export class IvrMainFormComponent extends FormBaseComponent implements OnInit {

    loading: number = 0;
    sipOuters: any;
    bsRangeValue = new Date();
    model: IvrItem;
    callRuleTimeDays = CallRuleDay.fromPlain([
        { type: 'accent', day: 'Mon', code: 'mon' },
        { type: 'accent', day: 'Tue', code: 'tue' },
        { type: 'accent', day: 'Wed', code: 'wed' },
        { type: 'accent', day: 'Thu', code: 'thu' },
        { type: 'accent', day: 'Fri', code: 'fri' },
        { type: 'cancel', day: 'Sat', code: 'sat' },
        { type: 'cancel', day: 'Sun', code: 'sun' }
    ]);

    durationTimes = CallRuleTimeType.fromPlain([
        { id: 1, code: 'Always (24 hours)' },
        { id: 2, code: 'Set the time' }
    ]);

    callRuleTimes = CallRuleTime.fromPlain([
        { time: '12:00 a.m', asteriskTime: '00:00' },
        { time: '1:00 a.m',  asteriskTime: '01:00' },
        { time: '2:00 a.m',  asteriskTime: '02:00' },
        { time: '3:00 a.m',  asteriskTime: '03:00' },
        { time: '4:00 a.m',  asteriskTime: '04:00' },
        { time: '5:00 a.m',  asteriskTime: '05:00' },
        { time: '6:00 a.m',  asteriskTime: '06:00' },
        { time: '7:00 a.m',  asteriskTime: '07:00' },
        { time: '8:00 a.m',  asteriskTime: '08:00' },
        { time: '9:00 a.m',  asteriskTime: '09:00' },
        { time: '10:00 a.m', asteriskTime: '10:00' },
        { time: '11:00 a.m', asteriskTime: '11:00' },
        { time: '12:00 p.m', asteriskTime: '12:00' },
        { time: '1:00 p.m',  asteriskTime: '13:00' },
        { time: '2:00 p.m',  asteriskTime: '14:00' },
        { time: '3:00 p.m',  asteriskTime: '15:00' },
        { time: '4:00 p.m',  asteriskTime: '16:00' },
        { time: '5:00 p.m',  asteriskTime: '17:00' },
        { time: '6:00 p.m',  asteriskTime: '18:00' },
        { time: '7:00 p.m',  asteriskTime: '19:00' },
        { time: '8:00 p.m',  asteriskTime: '20:00' },
        { time: '9:00 p.m',  asteriskTime: '21:00' },
        { time: '10:00 p.m', asteriskTime: '22:00' },
        { time: '11:00 p.m', asteriskTime: '23:00' },
    ]);
    then_data = [{id: 1, name: "TerminateCall"},
                 {id: 2, name: "Redirect"}]
    selectedDurationTimeRange =  [
        this.callRuleTimes[9],
        this.callRuleTimes[18]
    ];

    selectedFiles = [];
    files = [];
    ruleFor = [
        {id:1, name: "Allways"},
        {id:2, name: "Date (period)"},
        {id:3, name: "Day of the week"}
    ]
    period: any;
    @ViewChild('mediaPlayer') mediaPlayer: MediaPlayerComponent;
    
    modelTemplate: boolean = false;
    rule_value_visible = 0;
    timeVisible = false;
    // -- properties ----------------------------------------------------------


    // -- component lifecycle methods -----------------------------------------

    constructor(public service: IvrService,
        protected fb: FormBuilder,
        protected message: MessageServices,
        private refs: RefsServices,
        private storage: StorageService) {
        super(fb, message);
    }

    ngOnInit() {
        super.ngOnInit();
        this.service.reset();
        this.initFiles();
        this.getSipOuters();
    }

    initFiles() {
        this.service.getFiles().then((res)=>{
            this.files = res.items;
        });
    }
   
    initForm(): void {
        this.form = this.fb.group({
            id: [null],
            name: ['', [Validators.required, Validators.pattern(nameRegExp)]],
            description: ['', [Validators.maxLength(255)]],
            sip: [null, [Validators.required]],
            voice_greeting: [null, [Validators.required]],
            loop_message: [2, [Validators.required, Validators.pattern('[0-9]*')]],
            rule_for: [null],
            rule_value: [null],
            duration_time: [null],
            duration: [null],
            then: [null]
        });

        this.form.get("rule_for").valueChanges.subscribe(val => {
            this.rule_value_visible = val;
        });

        this.form.get("duration_time").valueChanges.subscribe(val => {
            this.timeVisible = (val === 2);
        });

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
                this.storage.checkFileExists(
                    file,
                    (loading) => {
                        if (!this.storage.loading) {
                            this.initFiles();
                        }
                    });
            }
            else {
                this.message.writeError('Accepted formats: mp3, ogg, wav');
            }
            this.storage.checkModal();
        }
    }

    selectFile(index: number, file: any): void {
        if (this.mediaPlayer.selectedMediaId !== file.id && this.mediaPlayer.state === MediaState.PLAYING) {
            this.mediaPlayer.stopPlay();
        }
        this.selectedFiles[index] = file;
    }

    selectDay(idx, day) {
        day.type = (day.type === 'accent') ? 'cancel' : 'accent'
    }

    visibleElementForRule(val) {
        return this.rule_value_visible === val;
    }

    selectTime(val, idx) {
        this.selectedDurationTimeRange[idx] = val;
    }

    getSipOuters() {
        this.loading++;
        this.refs.getSipOuters().then(response => {
            this.sipOuters = response;
            console.log(response);
        }).catch(() => { })
            .then(() => this.loading--);
    }
}
