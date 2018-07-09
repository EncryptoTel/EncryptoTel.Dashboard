import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';
import {Router} from '@angular/router';
import {RungGroupsModel, RungGroupsParams} from '../models/ring-groups.model';

@Injectable()
export class RingGroupsServices {
  constructor(private request: RequestServices,
              private router: Router) {
  }

  editMode = false;
  params: RungGroupsParams = {
    announceHoldtimes: [],
    strategies: []
  };
  ringGroups: RungGroupsModel = {
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

  save(id): void {
    if (this.editMode) {
      this.request.put(`v1/ring_group/${id}`, this.ringGroups, true).then(() => {
        this.router.navigate(['cabinet', 'ring-groups']);
      });
    } else {
      this.request.post('v1/ring_group', this.ringGroups, true).then(() => {
        this.router.navigate(['cabinet', 'ring-groups']);
      });
    }
  }

  cancel(): void {
    this.ringGroups = {
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
    this.router.navigate(['cabinet', 'ring-groups']);
  }

  setStrategiesFromId() {
    this.params.strategies.forEach(el => {
      if (el.id === this.ringGroups.strategy) {
        this.userView.strategy.code = el.code;
      }
    });
  }

  delete(id: number) {
    return this.request.del(`v1/call_queue/${id}`, true);
  }

  search(value: string) {
    return this.request.post(`v1/call_queue/members`, {sipOuter: this.ringGroups.sipId, q: value}, true);
  }

  getRingGroups() {
    return this.request.get('v1/ring_group', true);
  }

  getParams() {
    this.request.get(`v1/ring_group/params`, true).then((res: RungGroupsParams) => {
      this.params = res;
      console.log(this.params);
      if (this.editMode) {
        this.setStrategiesFromId();
      }
    }).catch(err => {
      console.error(err);
    });
  }

  getMembers(id: number) {
    return this.request.get(`v1/call_queue/members?sipOuter=${id}`, true);
  }

  getDepartments() {
    return this.request.get(`v1/department`, true);
  }

  getRingGroup(id) {
    return this.request.get(`v1/ring_group/${id}`, true);
  }
}
