import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import {HttpClient} from '@angular/common/http';
import {environment as env} from '../environments/environment';

import * as translationsData from '../assets/i18n/translations.json';

export class PbxTranslateLoader implements TranslateLoader {

    translationsRoot: string;
    translations: {} = {};

    constructor(private http: HttpClient) {
        this.translationsRoot = env.translation;
    }

    getTranslation(lang: string): Observable<any> {
        return Observable.of(this.translations[lang]);
    }

    loadTranslations(): Promise<any> {
        this.translations = {};

        return this.http.get(this.translationsRoot).toPromise().then(response => {
            Object.keys(response).forEach(key => {
                this.setTranslation(response[key], 'en', 'eng');
                this.setTranslation(response[key], 'ru', 'ru');
            });
            return Promise.resolve(this.translations);
        }).catch(() => {});
    }

    setTranslation(item: any, localLang: string, externalLang: string): void {
        if (!this.translations[localLang])
            this.translations[localLang] = {};
        
            this.translations[localLang][item['key']] = item[externalLang];
    }
}
