import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';
import {QueueModel, QueuesParams} from '../models/queue.model';
import {Router} from '@angular/router';
import {BaseService} from "./base.service";

export class CallQueueService extends BaseService {

    editMode = false;
    callQueue: QueueModel = {
        sipId: 0,
        name: '',
        strategy: 0,
        timeout: 30,
        announceHoldtime: 0,
        announcePosition: false,
        maxlen: 60,
        description: '',
        queueMembers: []
    };
    params: QueuesParams = {
        announceHoldtimes: [],
        strategies: []
    };
    userView = {
        phoneNumber: '',
        announceHoldtime: false,
        announcePosition: false,
        members: [],
        isCurCompMembersAdd: false,
        strategy: {
            code: ''
        }
    };

    save(id): Promise<any> {
        if (this.editMode) {
            return this.request.put(`v1/call_queue/${id}`, this.callQueue, true);
        } else {
            return this.request.post('v1/call_queue', this.callQueue, true);
        }
    }

    cancel(): void {
        this.callQueue = {
            sipId: 0,
            name: '',
            strategy: 0,
            timeout: 30,
            announceHoldtime: 0,
            announcePosition: false,
            maxlen: 60,
            description: '',
            queueMembers: []
        };
        this.userView = {
            phoneNumber: '',
            announceHoldtime: false,
            announcePosition: false,
            members: [],
            isCurCompMembersAdd: false,
            strategy: {
                code: ''
            }
        };
    }

    setStrategiesFromId() {
        this.params.strategies.forEach(el => {
            if (el.id === this.callQueue.strategy) {
                this.userView.strategy.code = el.code;
            }
        });
    }

    search(value: string) {
        return this.request.post(`v1/call_queue/members`, {sipOuter: this.callQueue.sipId, q: value}, true);
    }

    getQueues() {
        return this.request.get('v1/call_queue', true);
    }

    getMembers(id: number) {
        return this.request.get(`v1/call_queue/members?sipOuter=${id}`, true);
    }

    getDepartments() {
        return this.request.get(`v1/department`, true);
    }







    getParams(): Promise<any> {
        return super.getParams().then((res: QueuesParams) => {
            this.params = res;
            if (this.editMode) {
                this.setStrategiesFromId();
            }
            return res;
        });
    }

    onInit() {
        this.url = 'v1/call_queue';
    }

}
