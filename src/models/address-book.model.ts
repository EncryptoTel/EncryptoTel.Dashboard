export class ContactModel {
  constructor(public company: string,
              public countryId: number,
              public department: string,
              public firstname: string,
              public lastname: string,
              public contactAddresses: Contact[],
              public contactEmails: Contact[],
              public contactPhones: Contact[],
              public countryName?: string,
              public id?: number) {}
}

export class Contact {
  constructor(public value: string,
              public typeId: null | string | undefined,
              public extension?: string,
              public id?: number) {}
}

export class Country {
  constructor(public id: number,
              public code: string,
              public title: string) {}
}

export class Countries {
  constructor(public countries: Country[]) {}
}

export class Types {
  constructor(public contactAddresses: object,
              public contactEmails: object,
              public contactPhones: PhoneTypes) {}
}

export class PhoneTypes {
  constructor(public Home: number,
              public Work: number,
              public Mobile: number) {}
}
