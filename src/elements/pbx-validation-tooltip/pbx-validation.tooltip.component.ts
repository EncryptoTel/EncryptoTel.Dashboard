import {Component, HostListener, OnInit} from '@angular/core';


@Component({
    selector: 'pbx-validation-tooltip',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
})

export class ValidationTooltipComponent implements OnInit {
    errorMessage: string = 'ppppppppppppppppppppppp';
    
    constructor() {
        
    }

    ngOnInit() {
    }
}
