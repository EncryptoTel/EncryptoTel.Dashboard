import {BaseService} from "./base.service";
import {isDevEnv} from "../shared/shared.functions";

export class BaseQueueService extends BaseService {

    editMode: boolean = false;
    item;
    params;
    userView;
    membersBefore;

    reset() {
        this.errors = null;
    }

    getMembersMessage() {
        let message = '';
        let membersAdded = 0;
        let membersDeleted = 0;

        this.userView.members.map(item1 => {
            let isExists = false;
            this.membersBefore.map(item2 => {
                if (item1.id === item2.id) {
                    isExists = true;
                }
            });
            if (!isExists) {
                membersAdded++;
            }
        });
        this.membersBefore.map(item1 => {
            let isExists = false;
            this.userView.members.map(item2 => {
                if (item1.id === item2.id) {
                    isExists = true;
                }
            });
            if (!isExists) {
                membersDeleted++;
            }
        });

        membersAdded > 0 ? message = `${membersAdded} member(s) added successfully` : null;
        membersDeleted > 0 ? message = `${message ? `${message}, ` : ''}${membersDeleted} member(s) removed successfully` : null;
        return message;
    }

    saveMembersBefore() {
        this.membersBefore = [];
        this.userView.members.map(item => {
            this.membersBefore.push(item);
        });
    }

    addMember(member) {
        const index = this.item.queueMembers.findIndex(el => {
            return el.sipId === member.id; });
        if (index === -1) {
            this.item.queueMembers.push({sipId: member.id});
            this.userView.members.push(member);

        } else {
            this.item.queueMembers.splice(index, 1);
            this.userView.members.splice(this.userView.members.findIndex(el => {
                return el.id === member.id; }), 1);
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
        }
    }

    getMembers(sipId: number, search: string = null, departmentId: number = null) {
        let url = `v1/call_queue/members?sipOuter=${sipId}`;
        if (search) url = `${url}&filter[search]=${search}`;
        if (departmentId) url = `${url}&filter[department]=${departmentId}`;
        return this.request.get(url);
    }

    getDepartments(sipId: number) {
        return this.request.get(`v1/call_queue/departments?sipOuter=${sipId}`);
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

    save(id: number, ShowSuccess = true, ShowError = null): Promise<any> {
        this.errors = null;
        if (this.editMode) {
            return this.putById(id, this.item, ShowSuccess, ShowError);
        } else {
            return this.post('', this.item, ShowSuccess, ShowError);
        }
    }

    getParams(): Promise<any> {
        return super.getParams().then((res) => {
            this.params = res;
            this.params.strategies.forEach(item => {
                item.code = this.translate.instant(item.code);
            });
            if (this.editMode) {
                this.setParams();
            }
            return res;
        }).catch(() => {
            isDevEnv() && this.mockParams();
            if (this.editMode) {
                this.setParams();
            }
        });
    }

    mockParams(): void {
        this.params = {
            strategies: [
                { id: 1, code: 'Ring strategy 1' },
                { id: 2, code: 'Ring strategy 2' },
                { id: 3, code: 'Ring strategy 3' }
            ]
        };
    }
}
