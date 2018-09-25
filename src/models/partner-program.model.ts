import {BaseItemModel, PageInfoModel} from "./base.model";

export class PartnerProgramModel extends PageInfoModel {
    public items: PartnerProgramItem[];
}

export class PartnerProgramItem extends BaseItemModel {
    public id: number;
    public name: string;
    public refLink: string;
    public status: boolean;
    public totalBonus: number;
    public created: Date;

    get statusName(): string {
        return this.status ? 'Enabled' : 'Disabled';
    }

    get refLinkUrl(): string {
        if (this.refLink) {
            let location = window.location;
            let linkUrl = `${location.protocol}//${location.host}/ref/${this.refLink}`;
            // return `/ref/${this.refLink}`;
            return linkUrl;
        }
        return '';
    }

    constructor(response?: any) {
        super();
        this.name = '';
        if (response) {
            this.id = response.id;
            this.name = response.name;
            this.status = response.status;
            this.refLink = response.refLink;
            this.totalBonus = response.totalBonus;
            this.created = new Date(Date.parse(response.created));
        }
    }

}