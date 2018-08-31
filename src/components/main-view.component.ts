import {Component, HostBinding, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import {MessageServices} from '../services/message.services';

import {FadeAnimation} from '../shared/fade-animation';

// first and second
import * as $ from 'jquery';
declare var jquery:any;
// declare var $ :any;

@Component({
    selector: 'main-view',
    template: `
        <pbx-loader *ngIf="loading"></pbx-loader>
        <router-outlet *ngIf="!loading"></router-outlet>
        <pbx-notificator></pbx-notificator>
    `,
    animations: [FadeAnimation('300ms')]
})

export class MainViewComponent implements OnInit, OnDestroy {
    constructor(public _services: MessageServices,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private title: Title) {
    }

    // messagesList: MessageModel[];
    routerSubscription: Subscription;
    loading = false;


    public pageTitle = 'Encrypto Telecom';
    @HostBinding('class') public userTheme: string;

    public setUserTheme(theme: string) {
        this.userTheme = theme;
    }

    ngOnInit(): void {
        this.setUserTheme('dark_theme');
        // this._services.messagesList().subscribe(messages => {
        //     this.messagesList = messages;
        // });
        this.routerSubscription = this.router.events
            .filter((event) => event instanceof NavigationEnd)
            .map(() => this.activatedRoute)
            .map((route) => {
                while (route.firstChild) {
                    route = route.firstChild;
                }
                return route;
            })
            .filter((route) => route.outlet === 'primary')
            .mergeMap((route) => route.data)
            .subscribe((event) => {
                this.pageTitle = event['title'];
                this.title.setTitle(`Encrypto Telecom | ${event['title']}`);
            });

            jQuery(document).ready(function(){
                jQuery(window).on('click', function(){
                    console.log('jQuery is working 123');
                });
            });

    }

    ngOnDestroy(): void {
        this.routerSubscription.unsubscribe();
    }
}


