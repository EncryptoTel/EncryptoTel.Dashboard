export class PaymentModel {
    constructor(
        public amount: number,
        public address: string,
        public qrCode: string,
        public url: string,
        public loading: boolean
    ) {
    }
}
