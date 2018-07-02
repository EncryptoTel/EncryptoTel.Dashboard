import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
    selector: 'call-rules-timeout',
    templateUrl: './template.html',
    styleUrls: ['./local.sass']
})

export class CallRulesTimeoutComponent implements OnInit {
    @Input() value: number;
    @Output() onChange: EventEmitter<number> = new EventEmitter<number>();

    onKeyUpEvent(event): void {
        this.value = event.target.value;
        // console.log(this.timeout);
        this.onChange.emit(this.value);
    }

    ngOnInit() {
        // console.log('timeout init', this.value);
    }

}
