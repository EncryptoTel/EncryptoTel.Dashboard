import {BaseItemModel, PageInfoModel, PlayerModel} from "./base.model";
import {Type} from "class-transformer";

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
    @Type(() => Date)
    public created: Date;
    public price: number;
    public contactId: number;

    public player: PlayerModel = new PlayerModel();

    // public hover: boolean = false;
    public ddShow: boolean = false;
    public play: boolean = false;
    // public player: any = {};
    public playerLoading: boolean = false;
    public playerSeek: string = '';
    public mediaStream: any = null;
    public mediaLoading: boolean = false;

    get playable() {
        return this.accountFile && this.duration > 0;
    }

    get date() {
        return this.created.toLocaleDateString();
    }

    get displayDate() {
        return `${this.created.toLocaleDateString()} ${this.created.toLocaleTimeString()}`;
    }

    get displayDuration() {
        const sec_num = parseInt(`${this.duration}`, 10);
        const hours = Math.floor(sec_num / 3600) % 24;
        const minutes = Math.floor(sec_num / 60) % 60;
        const seconds = sec_num % 60;
        return [hours, minutes, seconds]
            .map(v => v < 10 ? '0' + v : v)
            .filter((v, i) => v !== '00 ' || i > 0)
            .join(':');
    }

    get displayStatus() {
        return this.statusName.toLowerCase();
    }

    get displayPrice() {
        return `$${this.price}`;
    }

}

export class AccountFileItem {

}