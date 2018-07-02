export class Module {
    constructor(
        public id: number,
        public title: string,
        public content: string,
        public price: number,
        public status: boolean,
        public color: number,
        public loading?: boolean) {
    }
}
