import {BaseItemModel, PageInfoModel} from "./base.model";

export class PartnerProgramModel extends PageInfoModel {
    public items: PartnerProgramItem[];
}

export class PartnerProgramItem extends BaseItemModel {
    public name: string;
}