import {BaseService} from "./base.service";

export class BaseQueueService extends BaseService {

    editMode: boolean = false;
    item;
    params;
    userView;
    membersAdded = 0;
    membersDeleted = 0;

    reset() {
        this.errors = null;
    }

    resetMemberCounters() {
        this.membersAdded = 0;
        this.membersDeleted = 0;
    }

    addMember(member) {
        const index = this.item.queueMembers.findIndex(el => {
            return el.sipId === member.id; });
        if (index === -1) {
            this.item.queueMembers.push({sipId: member.id});
            this.userView.members.push(member);
            this.membersAdded++;

        } else {
            this.item.queueMembers.splice(index, 1);
            this.userView.members.splice(this.userView.members.findIndex(el => {
                return el.id === member.id; }), 1);
            this.membersDeleted++;
        }

    }

    deleteMember(member): void {
        let checkResult = this.item.queueMembers.findIndex(el => {
            return el.sipId === member.id;
        });
        if (checkResult >= 0) {
            this.item.queueMembers.splice(checkResult, 1);
        }
        checkResult = this.userView.members.findIndex(el => {
            return el.id === member.id;
        });
        if (checkResult >= 0) {
            this.userView.members.splice(checkResult, 1);
            this.membersDeleted++;
        }
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
            return this.post('', this.item);
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