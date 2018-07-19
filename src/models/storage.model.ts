import {BaseItemModel, PageInfoModel} from "./base.model";
import {Type} from "class-transformer";

export class StorageModel extends PageInfoModel {
    public items: StorageItem[];
}

export class StorageItem extends BaseItemModel {
    public fileName: string;
    @Type(() => Date)
    public created: Date;
    public fileSize: number;
    public duration: number;

    get name() {
        return this.fileName;
    }

    get date() {
        return `${this.created.toLocaleDateString()} ${this.created.toLocaleTimeString()}`
    }

    get size() {
        return Math.round(this.fileSize / 1024 / 1024 * 100) / 100;
    }

}