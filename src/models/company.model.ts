export class CountriesModel {
  constructor(public countries: CountryModel[]) {}
}

export class CountryModel {
  constructor(public id: number,
              public code: string,
              title: string) {}
}
