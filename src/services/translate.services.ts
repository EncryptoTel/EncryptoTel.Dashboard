import {Injectable, EventEmitter} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

import {RequestServices} from './request.services';
import {LocalStorageServices} from './local-storage.services';

import {UserModel} from '../models/user.model';
import {NavigationItemModel} from '../models/navigation-item.model';

/*
  User services. Authentication, user params changing etc.
*/
@Injectable()
export class TranslateServices {

    constructor(private _request: RequestServices,
                private _storage: LocalStorageServices) {
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
               }
           };
       this._storage.writeItem('translate', array);
   }

   getByKey (key: string, lang: string = 'en') {
        let translate: any;
        translate = this._storage.readItem('translate');
        return translate[key][lang];
   }
}
