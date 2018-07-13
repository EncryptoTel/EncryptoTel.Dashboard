/*
  Regular expressions
 */
export const emailRegExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

export const nameRegExp = new RegExp(/^[\a-z\u00BF-\u1FFF\u2C00-\uD7FF0-9]+([\a-z\u00BF-\u1FFF\u2C00-\uD7FF0-9-. '])+$/i);

export const phoneRegExp = new RegExp(/^([\+]|[1-9]{1}|\+[1-9]{1})?[(]{0,1}[0-9]{1,3}[)]{0,1}[0-9]*$/);

export const months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const week: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
