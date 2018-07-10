import {CallQueueItem, CallQueueParams} from '../models/call-queue.model';
import {BaseQueueService} from "./base-queue.service";

export class CallQueueService extends BaseQueueService {

    item: CallQueueItem;

    params: CallQueueParams;

    getItem(id: number): Promise<any> {
        return this.getById(id).then(res => {
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
            return Promise.resolve(res);
        });
    }

    reset(): void {
        this.item = new CallQueueItem();
        this.userView = {
            phoneNumber: '',
            announceHoldtime: false,
            announcePosition: false,
            members: [],
            isCurCompMembersAdd: false,
            strategy: {
                code: ''
            },
        };
    }

    onInit() {
        this.url = 'v1/call_queue';
    }

}
