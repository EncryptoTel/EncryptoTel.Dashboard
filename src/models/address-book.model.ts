export class AddressBookModel {

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
