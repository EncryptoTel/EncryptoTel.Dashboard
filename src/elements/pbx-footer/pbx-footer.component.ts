import {Component, HostListener, OnInit, ElementRef} from '@angular/core';

import {FadeAnimation} from '../../shared/fade-animation';
import {killEvent} from '../../shared/shared.functions';
import {LangChangeEvent, TranslateService} from '@ngx-translate/core';
import {LocalStorageServices} from '@services/local-storage.services';

@Component({
    selector: 'pbx-footer',
    templateUrl: './template.html',
    styleUrls: ['./local.sass']
})
export class PbxFooterComponent implements OnInit {

    links: any;
    currentLang: string;
    languages: any;
    formVisible: boolean;
    buttonText: string;
    // @HostListener('document:click', ['$event']) clickout(event) {
    //     if (this.eRef.nativeElement.contains(event.target)) {
    //         this.formVisible = false;
    //     } else {
    //
    //     }
    //
    // }

    constructor(private eRef: ElementRef,
                public translate: TranslateService,
                private storage: LocalStorageServices) {
        this.languages = [
            {id: 'en', title: 'English (United States)'},
            {id: 'ru', title: 'Russian'},
        ];

        this.links = {
            'Terms and Conditions': {
                'title': 'Terms and Conditions',
                'link': 'EncryptoTel_Disclaimer.pdf'
            },
            'Privacy & cookie': {
                'title': 'Privacy & cookie',
                'link': 'EncryptoTel_Cookies_policy.pdf'
            },
            'Security Policy': {
                'title': 'Security Policy',
                'link': 'EncryptoTel_Privacy_Policy.pdf'
            },
            'Terms of use': {
                'title': 'Terms of use',
                'link': 'EncryptoTel_Terms_of_Use.pdf'
            }
        };
        let lang: string;
        lang = this.storage.readItem('user_lang', 'en');
        this.currentLang = this.languages.find(l => l.id === lang);
        this.formVisible = false;
        this.buttonText = 'Send';
    }

    ngOnInit(): void {
        this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
            this.links['Terms and Conditions'].title = this.translate.instant('Terms and Conditions');
            this.links['Privacy & cookie'].title = this.translate.instant('Privacy & cookie');
            this.links['Security Policy'].title = this.translate.instant('Security Policy');
            this.links['Terms of use'].title = this.translate.instant('Terms of use');
            this.buttonText = this.translate.instant('Send');
        });
    }

    onChange(newValue) {
        let currentLang: any;
        currentLang = newValue.id;
        this.currentLang = this.languages.find(lang => lang.id === currentLang);
        this.translate.use(currentLang);
        this.storage.writeItem('user_lang', currentLang);
    }

    showHideForm(event: Event) {
        event.stopPropagation();
        this.formVisible = !this.formVisible;
        return this.formVisible;
    }
}
