import {BaseItemModel, BaseParam, PageInfoModel} from "./base.model";

export class CallQueueModel extends PageInfoModel {
    items: CallQueueItem[];
}

export class CallQueueItem extends BaseItemModel {
    sipId: number;
    name: string;
    description: string;
    strategy: number;
    timeout: number;
    maxlen: number;
    announceHoldtime: number;
    announcePosition: boolean;
    queueMembers: CallQueueMember[];
}

export class CallQueueMember {
    sipId: number;
}

export class CallQueueParams {
    strategies: BaseParam[];
    announceHoldtimes: BaseParam[];
}
