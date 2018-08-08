/*
  Regular expressions
 */

export const emailRegExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))|[0-9]+-[0-9]{3}$/);

export const nameRegExp = new RegExp(/^[\a-z\u00BF-\u1FFF\u2C00-\uD7FF0-9]+([\a-z\u00BF-\u1FFF\u2C00-\uD7FF0-9-. '])+$/i);

export const phoneRegExp = new RegExp(/^\d{7,16}$/m);

export const week: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
