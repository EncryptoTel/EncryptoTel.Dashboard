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
        super(request, message);
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

    getMediaData(mediaId: number): Promise<any> {
        return this.request.get(`v1/account/file/${mediaId}`)
            .then(mediaDataResponse => {
                return this.http.get(mediaDataResponse['fileLink']).toPromise()
                    .then(response => {
                        return this.validateMediaStreamResponse(response)
                            ? Promise.resolve(mediaDataResponse)
                            : Promise.reject(response);
                    })
                    .catch(error => {
                        return this.validateMediaStreamResponse(error)
                            ? Promise.resolve(mediaDataResponse)
                            : Promise.reject(error);
                    });
            });
    }

    validateMediaStreamResponse(response: any): boolean {
        if (response.status != 200) {
            this.message.writeError('File not found');
            console.log('Media stream error', response);
            return false;
        }
        return true;
    }

    onInit() {
        this.url = 'v1/cdr';
    }

}
