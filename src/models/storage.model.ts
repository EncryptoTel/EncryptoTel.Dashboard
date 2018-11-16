import {BaseItemModel, PageInfoModel, PlayerModel, RecordModel} from "./base.model";
import {Type} from "class-transformer";
import {formatDateTime} from "../shared/shared.functions";

export class StorageModel extends PageInfoModel {
    public items: StorageItem[];
}

export class StorageItem extends BaseItemModel {
    public accountId: number;
    @Type(() => Date)
    public id: number;
    public created: Date;
    public description: string;
    public duration: number;
    public externalId: number;
    public fileName: string;
    public fileNameMd5: string;
    public fileSize: number;
    public md5: string;
    public originalFileName: string;
    public type: string;
    public converted: number;

    public player: PlayerModel;
    public record: RecordModel;

    get name() {
        return this.fileName;
    }

    get displayDateTime() {
        return formatDateTime(this.created);
    }

    get size() {
        return Math.round(this.fileSize / 1024 / 1024 * 100) / 100;
    }

    constructor() {
        super();
        this.player = new PlayerModel();
        this.record = new RecordModel();
    }
}
