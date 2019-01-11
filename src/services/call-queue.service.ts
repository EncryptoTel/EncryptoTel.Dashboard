import { CallQueueItem, CallQueueModel, CallQueueParams } from '../models/call-queue.model';
import { BaseQueueService } from './base-queue.service';
import { PageInfoModel } from '../models/base.model';
import { plainToClass } from 'class-transformer';

export class CallQueueService extends BaseQueueService {

  item: CallQueueItem;
  params: CallQueueParams;

  onInit() {
    this.url = 'call_queue';
  }

  getItem(id: number): Promise<any> {
    if (!id) {
      this.item = new CallQueueItem();
      this.editMode = false;

      return Promise.resolve(this.item);
    }
    return this.getById(id).then(res => {
      this.item.id = res.id;
      this.item.sipId = res.sip.id;
      this.item.name = res.name;
      this.item.strategy = res.strategy;
      this.item.timeout = res.timeout;
      this.item.maxlen = res.maxlen;
      this.item.announceHoldtime = res.announceHoldtime;
      this.item.announcePosition = res.announcePosition;
      this.item.description = res.description;

      this.userView.phoneNumber = res.sip.phoneNumber;
      this.setMembers(res.queueMembers);

      this.editMode = true;

      return Promise.resolve(res);
    });
  }

  reset() {
    super.reset();
    this.item = new CallQueueItem();
    this.userView = {
      phoneNumber: '',
      announceHoldtime: false,
      announcePosition: false,
      members: [],
      strategy: {
        code: ''
      },
    };
  }

  getMembers(sipId: number, search: string = null, departmentId: any = null) {
    let url = `v1/call_queue/members?sipOuter=${ sipId }`;
    if (search) url = `${ url }&filter[search]=${ search }`;
    if (departmentId && departmentId !== 'all') {
      url = `${ url }&filter[department]=${ departmentId }`;
    }
    return this.request.get(url);
  }

  getItems(pageInfo: PageInfoModel, filter = null, sort = null): Promise<CallQueueModel> {
    return super.getItems(pageInfo, filter, sort).then((res: CallQueueModel) => {
      const pageInfoNew = plainToClass(CallQueueModel, res);
      pageInfoNew.items = [];
      res[ 'items' ].map(item => {
        pageInfoNew.items.push(plainToClass(CallQueueItem, item));
      });
      return Promise.resolve(pageInfoNew);
    });
  }

  getOuters(): Promise<any> {
    return this.request.get(`v1/call_queue/outers?limit=1000`);
  }

  getMembersMessage(): string {
    const [ added, deleted ] = this.getMemebersStat();
    // callQueueMembersAddedMessage
    // You have added {{count}} member(s) to the Call Queue
    // Вы успешно добавили {{count}} участников в очередь звонков
    // callQueueMembersRemovedMessage
    // You have removed {{count}} member(s) to the Call Queue
    // Вы успешно удалили {{count}} участников из очереди звонков
    if (added) {
      return this.translate.instant('callQueueMembersAddedMessage', { count: added });
    }
    if (deleted) {
      return this.translate.instant('callQueueMembersRemovedMessage', { count: deleted });
    }
    return null;
  }
}
