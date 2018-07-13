import {BaseService} from "./base.service";

export class BaseQueueService extends BaseService {

    editMode: boolean = false;
    errors = null;
    item;
    params;
    userView;

    reset() {
        this.errors = null;
    }

    getMembers(sipId: number, search: string = null, departmentId: number = null) {
        let url = `v1/call_queue/members?sipOuter=${sipId}`;
        if (search) url = `${url}&filter[search]=${search}`;
        if (departmentId) url = `${url}&filter[department]=${departmentId}`;
        return this.request.get(url);
    }

    getDepartments() {
        return this.request.get(`v1/department`);
    }

    setMembers(members) {
        for (let i = 0; i < members.length; i++) {
            this.item.queueMembers.push({sipId: members[i].sip.id});
            this.userView.members.push(members[i].sip);
            this.userView.members[i].sipOuterPhone = this.userView.phoneNumber;
        }
    }

    setStrategiesFromId() {
        this.params.strategies.forEach(el => {
            if (el.id === this.item.strategy) {
                this.userView.strategy.code = el.code;
            }
        });
    }

    setParams() {
        this.setStrategiesFromId();
    }

    save(id: number): Promise<any> {
        this.errors = null;
        if (this.editMode) {
            return this.putById(id, this.item);
        } else {
            return this.post('', this.item).then(res => {
                return Promise.resolve(res);
            }).catch(res => {
                if (res.errors) {
                    this.errors = res.errors;
                }
                return Promise.reject(res);
            });
        }
    }

    getParams(): Promise<any> {
        return super.getParams().then((res) => {
            this.params = res;
            if (this.editMode) {
                this.setParams();
            }
            return res;
        });
    }

}