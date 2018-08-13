import {BaseItemModel, PageInfoModel} from "./base.model";

export class PartnerProgramModel extends PageInfoModel {
    public items: PartnerProgramItem[];
}

export class PartnerProgramItem extends BaseItemModel {
    public name: string;
    public refLink: string;
    public status: boolean;

    get statusName(): string {
        return this.status ? 'Active' : 'Disabled';
    }

    get refLinkUrl(): string {
        let location = window.location;
        let linkUrl = `${location.protocol}//${location.host}/ref/${this.refLink}`;
        // return `/ref/${this.refLink}`;
        return linkUrl;
    }

    constructor(response?: any) {
        super();
        this.name = '';
        if (response) {
            this.id = response.id;
            this.name = response.name;
            this.status = response.status;
        }
    }

}