export class RefillModel {
    constructor(
        public id: number,
        public title: string,
        public currency: CurrencyModel,
        public needReturnAddress: boolean,
        public loading: boolean
    ) {
    }
}

export class CurrencyModel {
    constructor(
        public id: number,
        public code: string,
        public name: string
    ) {
    }
}