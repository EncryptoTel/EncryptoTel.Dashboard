import { Injectable, EventEmitter } from '@angular/core';

import {TranslateServices} from '@services/translate.services';
import {LocalStorageServices} from '@services/local-storage.services';

@Injectable()
export class LangStateService {

    textLang: any;

    change: EventEmitter<boolean> = new EventEmitter();

    constructor(private _storage: LocalStorageServices, private _translate: TranslateServices) {
        const array: any = [];
        const lang: any = this._storage.readItem('user_lang');
        const translate: any = _translate.getTranslate();
        for (const key of translate) {
            array[key] = translate[key][lang];
        }
        this.textLang = array;
    }

    get() {
        return this.textLang;
    }

    set(value: any) {
        const array: any = [];
        const lang: any = this._storage.readItem('user_lang');
        for (const key of value) {
           array[key] = value[key][lang];
        }
        this.textLang = array;
        this.change.emit(this.textLang);
    }

}
