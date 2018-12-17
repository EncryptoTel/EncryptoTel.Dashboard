import {Component, EventEmitter, Input, Output, OnChanges, SimpleChanges} from '@angular/core';


@Component({
    selector: 'pbx-checkbox',
    templateUrl: './template.html',
    styleUrls: ['./local.sass']
})
export class CheckboxComponent implements OnChanges {
    
    @Input() value: boolean;
    @Input() disabled: boolean = false;

    @Output() onToggle: EventEmitter<boolean> = new EventEmitter<boolean>();


    ngOnChanges(changes: SimpleChanges): void {
        if (changes.disabled && changes.disabled.currentValue) {
            this.value = false;
        }
    }

    toggleCheckbox(): void {
        if (!this.disabled) {
            this.value = !this.value;
            this.onToggle.emit(this.value);
        }
    }
}
