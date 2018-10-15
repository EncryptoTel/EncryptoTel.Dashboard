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
        return this.http.get(this.translationsRoot).toPromise().then(response => {
            let tmp: any;
            tmp = Object.keys(response).forEach(item => {
                let lang: string;
                lang = 'en';
                if (!this.translations[lang]) {
                    this.translations[lang] = {};
                }
                this.translations[lang][response[item]['key']] = response[item]['eng'];
                lang = 'ru';
                if (!this.translations[lang]) {
                    this.translations[lang] = {};
                }
                this.translations[lang][response[item]['key']] = response[item]['ru'];
            });
            return Promise.resolve(this.translations);
        }).catch(response => {});
    }
}
