import {BaseItemModel, PageInfoModel} from "./base.model";

export class DepartmentModel extends PageInfoModel {
    items: DepartmentItem[];
}

export class DepartmentItem extends BaseItemModel {
    name: string;
    comment: string;
    employees: number;
    sipInnerIds: number[];
}

export class Sip {
    constructor(
        public id: number,
        public phoneNumber: string,
        public blocked?: boolean
    ) {
    }
}
