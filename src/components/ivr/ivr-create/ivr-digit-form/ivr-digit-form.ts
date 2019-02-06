import { Subject } from 'rxjs/Subject';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';

import {
    FormBuilder,
    Validators,
    FormGroup,
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { IvrService } from '@services/ivr.service';
import { MessageServices } from '@services/message.services';
import { FormBaseComponent } from '@elements/pbx-form-base-component/pbx-form-base-component.component';
import { FadeAnimation } from '@shared/fade-animation';
import { StorageService } from '@services/storage.service';
import { IvrFormInterface } from '../form.interface';
import { IvrLevel, DigitActions } from '@models/ivr.model';
import { MediaPlayerComponent } from '@elements/pbx-media-player/pbx-media-player.component';
import { CdrMediaInfo, MediaState } from '@models/cdr.model';
import { Subscription } from 'rxjs/Subscription';
import { InputComponent } from '@elements/pbx-input/pbx-input.component';


@Component({
    selector: 'pbx-ivr-digit-form',
    templateUrl: './ivr-digit-form.html',
    styleUrls: ['./ivr-digit-form.sass'],
    animations: [FadeAnimation('300ms')],
    providers: [StorageService]
})
export class IvrDigitFormComponent extends FormBaseComponent
    implements OnInit, IvrFormInterface, OnDestroy {
    onAddLevel: Function;
    references: any;
    data: any;
    actionVal = 0;
    digitFormKey: string = 'digitForm';
    currentMediaStream: string = '/assets/mp3/silence.mp3';
    loading: number = 0;
    digitForm: FormGroup;
    digits: Array<any> = [];
    sipInners: any;
    paramsInfo = {
        label: '',
        option: [],
        visible: false,
        validators: [],
    };
    onFormChange: Subject<any>;
    onDelete: Function;
    formPanel: Element = null;
    playButtonText: string;
    uploadedFile: Subscription;

    @ViewChild('mediaPlayer') mediaPlayer: MediaPlayerComponent;
    @ViewChild('actionData') actionData: InputComponent;
    // -- properties ----------------------------------------------------------

    get valid(): boolean {
        return this.digitForm.valid;
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
        private storage: StorageService,
        protected translate: TranslateService
    ) {
        super(fb, message, translate);
        this.onFormChange = new Subject();

        this.validationHost.customMessages = [
            { key: 'parameter', error: 'pattern', message: this.translate.instant('Phone number contains invalid characters. You can only use numbers.') },
        ];
    }

    ngOnInit() {
        this.initAvaliableDigit();
        super.ngOnInit();
        this.service.reset();
        if (!this.data.action) {
            this.data.action = DigitActions.CANCEL_CALL;
        }
        this.digitForm.patchValue(this.data);

        this.uploadedFile = this.storage.uploadedFile.subscribe(f => {
            this.service.getFiles().then(res => {
                if (f) {
                    this.paramsInfo.option = res.items.map(file => {
                        return { id: file.id, name: file.fileName };
                    });
                    const fileData = this.paramsInfo.option.find(
                        x => x.id === f.id
                    );
                    setTimeout(() => {
                        this.actionData.value = fileData;
                        this.digitForm.get('parameter').setValue(f.id);
                    }, 50);
                }
            });
        });
    }

    ngOnDestroy(): void { 
        this.uploadedFile.unsubscribe();
    }

    initForm(): void {
        this.digitForm = this.fb.group({
            digit: [null, [Validators.required]],
            description: ['', [Validators.maxLength(255)]],
            action: [null, [Validators.required]],
            parameter: [null, [Validators.required]]
        });

        this.addForm(this.digitFormKey, this.digitForm);
        if (this.digits.length) {
            this.digitForm.get('digit').setValue(this.digits[0].id);
        }
        this.digitForm.get('action').valueChanges.subscribe(actionValue => {
            this.loading++;
            this.service
                .showParameter(
                    actionValue,
                    this.service.currentSip,
                    this.references.levels,
                    this.data
                )
                .then(response => {
                    this.paramsInfo = response;
                    this.digitForm.get('parameter').setValidators(this.paramsInfo.validators);
                    if (actionValue !== this.data.action) {
                        this.digitForm.get('parameter').setValue(null);
                    }
                    this.digitForm.get('parameter').markAsUntouched();
                    this.validationHost.initItems();
                })
                .catch(() => { })
                .then(() => {
                    this.loading--;
                });
        });

        this.digitForm.get('parameter').valueChanges.subscribe(val => {
            if (this.digitForm.value.action === '7' && val === -1) {
                val = this.onAddLevel(new IvrLevel());
                this.digitForm
                    .get('parameter')
                    .setValue(val, { onlySelf: true });
            }
        });

        this.digitForm.statusChanges.subscribe(() => {
            this.onFormChange.next(this.digitForm);
        });
    }

    getData() {
        return this.validateForms() ? this.digitForm.value : null;
    }

    getExtensions(id: number): void {
        this.loading++;
        this.service
            .getExtensions(id)
            .then(response => {
                this.sipInners = response.items;
            })
            .catch(() => { })
            .then(() => this.loading--);
    }

    deleteDigit() {
        if (this.onDelete) {
            this.onDelete(this.data);
        }
    }

    initAvaliableDigit() {
        for (let i = 1; i <= 10; i++) {
            const number = i % 10;
            if (
                !this.references.usedDigit.includes(number.toString()) ||
                i.toString() === this.data.digit
            ) {
                this.digits.push({
                    id: number.toString(),
                    title: number.toString()
                });
            }
        }
        if (
            !this.references.usedDigit.includes('*') ||
            this.data.digit === '*'
        ) {
            this.digits.push({ id: '*', title: '*' });
        }
        if (
            !this.references.usedDigit.includes('#') ||
            this.data.digit === '#'
        ) {
            this.digits.push({ id: '#', title: '#' });
        }
    }


    isFileSelected(): boolean {
        if (!this.digitForm.value.parameter) return false;
        const fileId = this.digitForm.value.parameter;
        const file = this.service.references.files.find(
            f => +f.id === +fileId
        );
        return !!file && file.converted !== undefined && file.converted > 0;
    }

    uploadFile(event: any): void {
        event.preventDefault();

        const file = event.target.files[0];
        event.target.value = '';
        if (file) {
            if (this.storage.checkCompatibleType(file)) {
                this.storage.checkFileExists(
                    file,
                    (loading) => { });
            }
            else {
                this.message.writeError(this.translate.instant('Accepted formats: mp3, ogg, wav'));
            }
            this.storage.checkModal();
        }
    }

    togglePlay(): void {
        const fileId = this.digitForm.value.parameter;
        if (fileId) {
            this.mediaPlayer.togglePlay(fileId);
        }
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
                this.mediaPlayer.locker.unlock();
                this.mediaStateChanged(MediaState.PAUSED);
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
}
