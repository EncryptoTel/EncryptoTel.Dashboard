import {Injectable, EventEmitter} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

import {RequestServices} from './request.services';
import {LocalStorageServices} from './local-storage.services';

import {UserModel} from '../models/user.model';
import {NavigationItemModel} from '../models/navigation-item.model';
import {UserServices} from './user.services';

/*
  User services. Authentication, user params changing etc.
*/
@Injectable()
export class TranslateServices {
    userLang: string;

    constructor(private _request: RequestServices,
                private _storage: LocalStorageServices,
                private _userService: UserServices) {
    }

   getTranslate () {
       let array: any;
       array =
           {
               'dashboard': {
                   'en': 'Dashboard',
                   'ru': 'Панель Управления'
               },
               'phone_numbers': {
                   'en': 'Phone Numbers',
                   'ru': 'Номера Телефонов'
               },
               'address_book': {
                   'en': 'Address Book',
                   'ru': 'Телефонная Книга'
               },
               'call_rules': {
                   'en': 'Call Rules',
                   'ru': 'Правила Звонков'
               },
               'call_queues': {
                   'en': 'Call Queues',
                   'ru': 'Очередь Звонков'
               },
               'ring_groups': {
                   'en': 'Ring Group',
                   'ru': 'Группа Звонков'
               },
               'company': {
                   'en': 'Company',
                   'ru': 'Компания'
               },
               'departments': {
                   'en': 'Departments',
                   'ru': 'Департаменты'
               },

               'extensions': {
                   'en': 'Extensions',
                   'ru': 'Добавочные Номера'
               },

               'details_and_records': {
                   'en': 'Details and Records',
                   'ru': 'Детали и Записи'
               },

               'invoices': {
                   'en': 'Invoices',
                   'ru': 'Квитанции'
               },

               'marketplace': {
                   'en': 'Marketplace',
                   'ru': 'Магазин'
               },

               'storage': {
                   'en': 'Storage',
                   'ru': 'Хранилище'
               },

               'knowledge_base': {
                   'en': 'Knowledge Base',
                   'ru': 'База Знаний'
               },

               'partner_program': {
                   'en': 'Partner Program',
                   'ru': 'Партнерская Программа'
               },

               'settings': {
                   'en': 'Settings',
                   'ru': 'Настройки'
               },
               'Profile Settings': {
                   'en': 'Profile Settings',
                   'ru': 'Настройки Профиля'
               },
               'save': {
                   'en': 'Save',
                   'ru': 'Сохранить'
               },
               'cancel': {
                   'en': 'Cancel',
                   'ru': 'Отменить'
               },
               'Drop files here to upload': {
                   'en': 'Drop files here to upload',
                   'ru': 'Переместите файл(ы) для загрузки'
               },
               'select files': {
                   'en': 'select file',
                   'ru': 'Выберите файл'
               },
               'or': {
                   'en': 'or',
                   'ru': 'или'
               },
               // '': {
               //     'en': '',
               //     'ru': ''
               // },
           };
       this._storage.writeItem('translate', array);
       return array;
   }

   getByKey (key: string, lang: string = 'en') {
        let translate: any;
        translate = this._storage.readItem('translate');
        return translate[key][lang];
   }

   getUserLang () {
        return this._storage.readItem('user_lang');
   }

   translate () {
       this._userService.fetchNavigationParams()
           .then((res) => {
               let tmp: any;
               tmp = res;
               // this._translate.getByKey(key, this.userLang);
               for (let i = 0; i < tmp.length; i++) {
                   for (let j = 0; j < tmp[i].length; j++) {
                       tmp[i][j]['name'] = this.getByKey(tmp[i][j]['name'], this.getUserLang());
                   }
               }
               return tmp;
           })
           .then(() => {})
           .catch();
   }

}
