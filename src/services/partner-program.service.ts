import {BaseService} from "./base.service";

export class PartnerProgramService extends BaseService {

    save(id: number, name: string): Promise<any> {
        if (id) {
            return this.putById(id, {name: name});
        } else {
            return this.post('', {name: name});
        }
    }

    onInit() {
        this.url = 'v1/partner';
    }

}
