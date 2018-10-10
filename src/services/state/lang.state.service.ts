import { Injectable, Output, EventEmitter } from '@angular/core';
import {UserServices} from '../user.services';
import {TranslateServices} from '../translate.services';
import {EmailChangeState} from '../../components/settings/settings-items/profile/profile.component';
import {Router} from '@angular/router';
import {LocalStorageServices} from '../local-storage.services';
import {MessageServices} from '../message.services';
import {FormBuilder} from '@angular/forms';
import {SettingsService} from '../settings.service';

@Injectable()
export class LangStateService {

    textLang: any;

    @Output() change: EventEmitter<boolean> = new EventEmitter();

    constructor(private _storage: LocalStorageServices, private _translate: TranslateServices) {
        let key: any;
        let array: any;
        let translate: any;
        translate =  _translate.getTranslate();
        let lang: any;
        lang = this._storage.readItem('user_lang');
        array = [];
        for (key in translate) {
            array[key] = translate[key][lang];
        }
        this.textLang = array;
    }

    get() {
        return this.textLang;
    }

    set(value: any) {
        let key: any;
        let array: any;
        let lang: any;
        lang = this._storage.readItem('user_lang');
        array = [];
        for (key in value) {
           array[key] = value[key][lang];
        }
        this.textLang = array;
        this.change.emit(this.textLang);
    }

}
