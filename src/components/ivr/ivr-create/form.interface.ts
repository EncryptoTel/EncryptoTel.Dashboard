import { Subject } from 'rxjs/Subject';
export interface IvrFormInterface {
    data: any;
    references: any;
    onDelete: Function;
    onFormChange: Subject<any>;
}
