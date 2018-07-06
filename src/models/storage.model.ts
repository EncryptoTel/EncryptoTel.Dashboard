import {PageInfoModel} from "./page-info.model";

export class StorageModel extends PageInfoModel {
    public items: StorageItem[];
}

export class StorageItem {

    public id: number;
    public fileName: string;
    public created: Date;
    public fileSize: number;
    public duration: number;
}