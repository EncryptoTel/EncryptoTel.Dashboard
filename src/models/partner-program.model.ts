import {BaseItemModel, PageInfoModel} from "./base.model";

export class PartnerProgramModel extends PageInfoModel {
    public items: PartnerProgramItem[];
}

export class PartnerProgramItem extends BaseItemModel {
    public name: string = '';
    public refLink: string;
    public status: boolean;

    get statusName() {
        return this.status ? 'Active' : 'Disabled';
    }

    get refLinkUrl() {
        return `/ref/${this.refLink}`;
    }

    constructor(response?: any) {
        super();
        if (response) {
            this.id = response.id;
            this.name = response.name;
            this.status = response.status;
        }
    }

}