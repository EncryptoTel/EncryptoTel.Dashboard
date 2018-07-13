import {Injectable} from '@angular/core';
import {RingGroupItem, RingGroupParams} from "../models/ring-group.model";
import {BaseQueueService} from "./base-queue.service";

@Injectable()
export class RingGroupService extends BaseQueueService {

    item: RingGroupItem;

    params: RingGroupParams;

    getItem(id: number): Promise<any> {
        return this.getById(id).then(res => {
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
            isCurCompMembersAdd: false,
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

    onInit() {
        this.url = 'v1/ring_group';
    }

}
