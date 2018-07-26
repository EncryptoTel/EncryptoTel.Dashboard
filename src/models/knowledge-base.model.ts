import {BaseItemModel, PageInfoModel} from "./base.model";

export class HelpGroupModel extends PageInfoModel {
    items: HelpGroupItem[];
}

export class HelpGroupItem extends BaseItemModel {
    title: string;
    description: string;
}

export class HelpModel extends PageInfoModel {
    items: HelpItem[];
}

export class HelpItem extends BaseItemModel {
    title: string;
    text; string;
}
