import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Injectable()
export class RouterExtService {
    private _lastUrl: string = undefined;
    private _currentUrl: string = undefined;

    public get lastUrl(): string {
        return this._lastUrl;
    }    

    public get currentUrl(): string {
        return this._currentUrl;
    }    

    constructor(private router : Router) {
        this._currentUrl = this.router.url;
        router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {        
                this._lastUrl = this._currentUrl;
                this._currentUrl = event.url;
            };
        });
    }
}