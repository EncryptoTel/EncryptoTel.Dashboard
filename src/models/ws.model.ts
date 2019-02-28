export class BalanceModel {
    constructor(
        public balance: number,
    ) {}
}

export class ServiceModel {
    constructor(
        public id: number,
    ) {}
}

export class CdrModel {
    constructor(
        public id: number,
    ) {}
}

export class SupportModel {
    constructor(
        public id: number,
        public status: number
    ) {}
}
