import {environment} from '../environments/environment';

/*
  Environment-specific variables
 */

export const back = environment.production ?
  'http://pbx.encryptotel.com/api' : environment.title === 'local' ?
    'http://pbx-front-local.encry.ru/api' : 'http://pbx-front-dev.encry.ru/api';

/*
  Regular expressions
 */

export const emailRegExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

export const nameRegExp = new RegExp(/^[\a-z]([\a-z-.]*)+$/i);
