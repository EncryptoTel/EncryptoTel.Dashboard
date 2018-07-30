import {BaseItemModel, PageInfoModel} from "./base.model";

export class CdrModel extends PageInfoModel {
    items: CdrItem[];
}

export class CdrItem extends BaseItemModel {
    public accountFile: AccountFileItem;
    public duration: number = 0;
    public source: string;
    public destination: string;
    public status: number;
    public statusName: string;
    public type: number;
    public tag: string;

    public hover: boolean = false;
    public ddShow: boolean = false;
    public play: boolean = false;
    public playerAnimationState: string = 'min';
    public playerContentShow: boolean = false;
    public player: any = {};
    public playerLoading: boolean = false;
    public playerSeek: string = '';
    public playing: boolean = false;
    public mediaStream: any = null;
    public mediaLoading: boolean = false;
    public mediaPlayTime: number = 0;

    get playable() {
        return this.accountFile && this.duration > 0;
    }

}

export class AccountFileItem {

}