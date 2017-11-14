import {environment} from '../environments/environment';

/*
  Environment-specific variables
 */

export const back = environment.production ? 'http://pbx-front.encry.ru/api' : 'http://pbx-back-dev.encry.ru';

export const auth_params = {
  client_id: 2,
  client_secret: 'ABjSJ4330mk7uOo148q9z0xZMgxUPciYiipFZFXV',
  grant_type: 'password',
  scope: '*'
};

export const emailRegExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

export const nameRegExp = new RegExp(/^[\a-z]([\a-z-.]*)+$/i);
