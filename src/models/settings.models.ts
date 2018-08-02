import {BaseItemModel, PageInfoModel} from "./base.model";
import {Type} from "class-transformer";
import {formatDateTime} from "../shared/shared.functions";

export class SessionsModel extends PageInfoModel {
    items: SessionItem[] = [];
}

export class SessionItem extends BaseItemModel {
    country: string;
    ip: string;
    userAgent: string;
    userToken: string;
    @Type(() => Date)
    expires: Date;

    get displayExpires() {
        return formatDateTime(this.expires);
    }

}