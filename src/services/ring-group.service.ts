import {Injectable} from '@angular/core';
import {RingGroupItem, RingGroupModel, RingGroupParams} from "../models/ring-group.model";
import {BaseQueueService} from "./base-queue.service";
import {plainToClass} from "class-transformer";
import {PageInfoModel} from "../models/base.model";

@Injectable()
export class RingGroupService extends BaseQueueService {

    item: RingGroupItem;

    params: RingGroupParams;

    getItem(id: number): Promise<any> {
        return this.getById(id).then(res => {
            this.item.id = res.id;
            this.item.sipId = res.sip.id;
            this.item.name = res.name;
            this.item.strategy = res.strategy;
            this.item.timeout = res.timeout;
            this.item.description = res.description;
            this.item.action = res.action;
            this.userView.phoneNumber = res.sip.phoneNumber;
            this.setMembers(res.queueMembers);
            return Promise.resolve(res);
        });
    }

    validation(): boolean {
        return !(
            this.item.sipId &&
            this.item.name &&
            (this.item.name.length < 255) &&
            this.item.strategy &&
            this.item.timeout &&
            this.item.queueMembers.length > 0
        );
    }

    reset() {
        super.reset();
        this.item = new RingGroupItem();
        this.userView = {
            phoneNumber: '',
            members: [],
            strategy: {
                code: ''
            },
            action: {
                code: ''
            },
        };
    }

    setActionFromId() {
        this.params.actions.forEach(el => {
            if (el.id === this.item.action) {
                this.userView.action.code = el.code;
            }
        });
    }

    setParams() {
        this.setStrategiesFromId();
        this.setActionFromId();
    }

    getItems(pageInfo: PageInfoModel, filter = null): Promise<RingGroupModel> {
        return super.getItems(pageInfo, filter).then((res: RingGroupModel) => {
            let pageInfo = plainToClass(RingGroupModel, res);
            pageInfo.items = [];
            res['items'].map(item => {
                pageInfo.items.push(plainToClass(RingGroupItem, item));
            });
            return Promise.resolve(pageInfo);
        });
    }

    getOuters(): Promise<any> {
        return this.request.get(`v1/ring_group/outers?limit=1000`);
    }

    onInit() {
        this.url = 'ring_group';
    }

}
