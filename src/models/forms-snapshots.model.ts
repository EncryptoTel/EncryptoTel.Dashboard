import { FormGroup } from "@angular/forms";

export class FormsSnapshots {
    private _map: {};
    private _snapshots: {};

    constructor() {
        this._map = {};
        this._snapshots = {};
    }

    add(key: string, form: FormGroup): void {
        this._map[key] = form;
    }
    
    save(key: string): void {
        if (!this._map[key]) return;

        let snapshot = JSON.stringify(this._map[key].value);
        this._snapshots[key] = snapshot;
    }
    
    clear(key: string): void {
        if (!this._map[key]) return;
        this._snapshots[key] = null;
    }
    
    check(key: string): boolean {
        if (!this._map[key]) return false;
        
        let snapshot = JSON.stringify(this._map[key].value);
        return snapshot != this._snapshots[key];
    }
}
