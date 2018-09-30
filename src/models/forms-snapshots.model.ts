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

        let snapshot = this.takeSnapshot(key);
        this._snapshots[key] = snapshot;
    }

    saveAll(): void {
        Object.keys(this._map).forEach(key => this.save(key));
    }
    
    clear(key: string): void {
        if (!this._map[key]) return;
        this._snapshots[key] = null;
    }
    
    check(key: string): boolean {
        if (!this._map[key]) return false;
        
        let snapshot = this.takeSnapshot(key);
        // console.log('check:1', key, this._snapshots[key]);
        // console.log('check:2', snapshot);
        return snapshot != this._snapshots[key];
    }

    checkAll(): boolean {
        let result = false;
        Object.keys(this._map).forEach(key => result = result || this.check(key));
        return result;
    }

    takeSnapshot(key: string): string {
        let snapshot = JSON.stringify(this._map[key].value);
        snapshot = snapshot.split('null').join('""');
        return snapshot;
    }
}
