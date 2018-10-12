import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import {HttpClient} from '@angular/common/http';
import {resolve} from 'core-js/fn/promise';

import * as translationsData from '../assets/i18n/translations.json';


export const TRANSLATIONS_ROOT = '/assets/i18n';

export class PbxTranslateLoader implements TranslateLoader {

    translations: {} = {};
    
    constructor(private http: HttpClient) {
    }

    getTranslation(lang: string): Observable<any> {
        return Observable.of(this.translations[lang]);
    }

    loadTranslations(): Promise<any> {
        return this.http.get(`${TRANSLATIONS_ROOT}/translations.json`).toPromise().then(translations => {
            Object.keys(translations).forEach(key => {
                    Object.keys(translations[key]).forEach(lang => {
                        if (!this.translations[lang]) this.translations[lang] = {};
                        this.translations[lang][key] = translations[key][lang];
                    });
            });
            resolve(translations);
        });
    }
}