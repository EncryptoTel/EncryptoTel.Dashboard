export class PaymentModel {
    constructor(
        public paymentId: string,
        public paymentHash: string,
        public amount: number,
        public address: string,
        public qrCode: string,
        public url: string,
        public loading: boolean
    ) {
    }
}
