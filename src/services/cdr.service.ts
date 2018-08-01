import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {BaseService} from "./base.service";
import {PageInfoModel} from "../models/base.model";
import {CdrItem, CdrModel} from "../models/cdr.model";
import {RequestServices} from "./request.services";
import {MessageServices} from "./message.services";

@Injectable()
export class CdrService extends BaseService {

    constructor(
        public request: RequestServices,
        public message: MessageServices,
        public http: HttpClient
    ) {
        super(request, message, http);
    }

    isRecordPlayable(item: CdrItem): boolean {
        return item.accountFile && item.duration > 0;
    }

    getItems(pageInfo: PageInfoModel, filter = null, sort = null): Promise<CdrModel> {
        return super.getItems(pageInfo, filter, sort).then((res: CdrModel) => {
            let pageInfo = this.plainToClassEx(CdrModel, CdrItem, res);
            // playable should be assigned here as it depends on data structure,
            // so would be good to let service do it
            pageInfo.items.forEach((item: CdrItem) => {
                item.record.playable = this.isRecordPlayable(item);
                item.record.duration = item.duration;
            });
            return Promise.resolve(pageInfo);
        });
    }

    onInit() {
        this.url = 'v1/cdr';
    }

}
