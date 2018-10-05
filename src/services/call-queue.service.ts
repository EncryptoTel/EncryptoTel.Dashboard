import {CallQueueItem, CallQueueModel, CallQueueParams} from '../models/call-queue.model';
import {BaseQueueService} from "./base-queue.service";
import {PageInfoModel} from "../models/base.model";
import {plainToClass} from "class-transformer";

export class CallQueueService extends BaseQueueService {

    item: CallQueueItem;

    params: CallQueueParams;

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

    getItems(pageInfo: PageInfoModel, filter = null): Promise<CallQueueModel> {
        return super.getItems(pageInfo, filter).then((res: CallQueueModel) => {
            let pageInfo = plainToClass(CallQueueModel, res);
            pageInfo.items = [];
            res['items'].map(item => {
                pageInfo.items.push(plainToClass(CallQueueItem, item));
            });
            return Promise.resolve(pageInfo);
        });
    }

    getOuters(): Promise<any> {
        return this.request.get(`v1/call_queue/outers?limit=1000`);
    }

    onInit() {
        this.url = 'call_queue';
    }

}
