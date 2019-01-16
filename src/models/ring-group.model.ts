import {BaseItemModel, PageInfoModel} from "./base.model";

export class RingGroupModel extends PageInfoModel {
    items: RingGroupItem[];
}

export class RingGroupItem extends BaseItemModel {
    sipId: number;
    name: string;
    description: string;
    strategy: number;
    timeout: number;
    action: number;
    editable: boolean = true;
    queueMembers: RingGroupMember[];

    constructor() {
        super();
        this.id = 0;
        this.sipId = null;
        this.strategy = null;
        this.name = '';
        this.description = '';
        this.timeout = 60;
        this.action = 5;
        this.queueMembers = [];
    }
}

export class RingGroupMember {
    sipId: number;
}

export class RingGroupParams {
    actions = [];
    strategies = [];
}

// export class RungGroupsModel {
//   constructor(
//   ) {}
// }
//
// export class RingGroupsListItem {
//   constructor(
//     public id: number,
//     public name: string,
//     public strategy: number,
//     public timeout: number,
//     public announceHoldtime: number,
//     public announcePosition: boolean,
//     public maxlen: number,
//     public description: string,
//   ) {}
// }
//
// export class RungGroupsParams {
//   constructor(
//     public announceHoldtimes: Param[],
//     public strategies: Param[]
//   ) {}
// }
//
// export class Param {
//   constructor(
//     public id: number,
//     public code: string,
//   ) {}
// }
//
// export class Members {
//   constructor(
//     public items: SipInner[]
//   ) {}
// }
//
// export class SipInner {
//   constructor(
//     public id: number,
//     public phoneNumber: string,
//     public status: number,
//     public sipOuterPhone?: string,
//     public statusName?: string
//   ) {}
// }
//
// export class Departments {
//   constructor(
//     public items: any[]
//   ) {}
// }
