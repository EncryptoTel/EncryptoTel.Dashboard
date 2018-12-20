import {BaseItemModel, PageInfoModel, PlayerModel, RecordModel} from "./base.model";
import {Type, Transform} from "class-transformer";
import {formatDateTime} from "../shared/shared.functions";
import * as moment from 'moment';

export class StorageModel extends PageInfoModel {
    public items: StorageItem[];
}

export class StorageItem extends BaseItemModel {
    public accountId: number;
    public created: string;
    public modified: string;
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
    public callDetail: any;
    public from: string;
    public to: string;
    public player: PlayerModel;
    public record: RecordModel;

    get name() {
        return this.fileName;
    }

    get displayDateTime() {
        return this.created;
    }

    get displayModifiedDate() {
        return this.modified;
    }

    get size() {
        return Math.round(this.fileSize / 1024 / 1024 * 100) / 100;
    }

    get durationFormat() {
        return moment(moment.duration(this.duration, 'second').asMilliseconds()).format('mm:ss');
    }

    constructor() {
        super();
        this.player = new PlayerModel();
        this.record = new RecordModel();
    }
}
