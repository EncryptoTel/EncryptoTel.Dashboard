export class Sip {
    constructor(
        public id: number,
        public phoneNumber: string,
        public blocked?: boolean
    ) {
    }
}

export class DepartmentModel {
    constructor(
        public comment: string,
        public employees: null | number,
        public employeesExt: null | number,
        public id: number,
        public name: string,
        public sipInnerIds: number[]
    ) {
    }
}
