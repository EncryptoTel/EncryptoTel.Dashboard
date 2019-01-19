import { BaseItemModel, BaseParam, PageInfoModel } from './base.model';

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
  editable: boolean = true;

  constructor() {
    super();
    this.id = 0;
    this.sipId = null;
    this.strategy = null;
    this.name = '';
    this.description = '';
    this.timeout = 60;
    this.maxlen = 60;
    this.announcePosition = false;
    this.announceHoldtime = 0;
    this.queueMembers = [];
  }

}

export class CallQueueMember {
  sipId: number;
}

export class CallQueueParams {
  strategies: BaseParam[];
  announceHoldtimes: BaseParam[];
}
