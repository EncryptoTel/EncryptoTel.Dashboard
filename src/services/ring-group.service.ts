import { Injectable } from '@angular/core';
import { plainToClass } from 'class-transformer';

import { RingGroupItem, RingGroupModel, RingGroupParams } from '@models/ring-group.model';
import { PageInfoModel } from '@models/base.model';
import { BaseQueueService } from '@services/base-queue.service';


@Injectable()
export class RingGroupService extends BaseQueueService {

  item: RingGroupItem;
  params: RingGroupParams;

  onInit() {
    this.url = 'ring_group';
  }

  getItem(id: number): Promise<any> {
    if (!id) {
      this.item = new RingGroupItem();
      this.editMode = false;

      return Promise.resolve(this.item);
    }
    return this.getById(id).then(response => {
      this.item.id = response.id;
      this.item.sipId = response.sip.id;
      this.item.name = response.name;
      this.item.strategy = response.strategy;
      this.item.timeout = response.timeout;
      this.item.description = response.description;
      this.item.action = response.action;

      this.userView.phoneNumber = response.sip.phoneNumber;
      this.setMembers(response.ringGroupMembers);

      this.editMode = true;

      return Promise.resolve(response);
    });
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

  getItems(pageInfo: PageInfoModel, filter = null, sort = null): Promise<RingGroupModel> {
    return super.getItems(pageInfo, filter, sort).then((res: RingGroupModel) => {
      const pageInfoNew = plainToClass(RingGroupModel, res);
      pageInfoNew.items = [];
      res[ 'items' ].map(item => {
        pageInfoNew.items.push(plainToClass(RingGroupItem, item));
      });
      return Promise.resolve(pageInfoNew);
    });
  }

  getOuters(): Promise<any> {
    return this.request.get(`v1/ring_group/outers?limit=1000`);
  }

  getMembers(sipId: number, search: string = null, departmentId: any = null) {
    let url = `v1/ring_group/members?sipOuter=${ sipId }`;
    if (search) url = `${ url }&filter[search]=${ search }`;
    if (departmentId && departmentId !== 'all') {
      url = `${ url }&filter[department]=${ departmentId }`;
    }
    return this.request.get(url);
  }

  getDepartments(sipId: number) {
    return this.request.get(`v1/ring_group/departments?sipOuter=${ sipId }`);
  }

  getMembersMessage(): string {
    const [ added, deleted ] = this.getMemebersStat();
    if (added) {
      return this.translate.instant('ringGroupMembersAddedMessage', { count: added });
    }
    if (deleted) {
      return this.translate.instant('ringGroupMembersRemovedMessage', { count: deleted });
    }
    return null;
  }
}
