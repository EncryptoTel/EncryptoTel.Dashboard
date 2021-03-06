import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild, OnChanges, SimpleChanges } from '@angular/core';

import { SwipeAnimation } from '@shared/swipe-animation';
import { killEvent, updateOptionNames } from '@shared/shared.functions';


@Component({
    selector: 'pbx-select',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [SwipeAnimation('y', '200ms')]
})
export class SelectComponent implements OnInit, OnChanges {

    fromComponent: boolean = false;
    isVisible = false;
    selectedObject = false;

    @Input() name: string;
    @Input() singleBorder: boolean;
    @Input() options: any[];
    @Input() objectKey: string;
    @Input() objectCount: string;
    @Input() showCount: boolean = false;

    @Input()
    set selected(selected: any) {
        if (typeof selected === 'number' || typeof selected === 'string') {
            let option: any;
            option = this.options.find(o => +o.id === +selected);
            if (option) this._selected = option;
        } else {
            this._selected = selected;
        }

        if (this._selected) {
            this.selectedObject = true;
        }
    }
    _selected: any;

    @Input()
    set placeholder(placeholder: string) {
        this._placeholder = placeholder;
        if (this._selected === undefined || this._selected === null) {
            this.selectedObject = false;
        } else {
            if (this._selected[this.objectKey] !== '') {
                this.selectedObject = true;
            }
            if (this._selected[this.objectKey] === undefined) {
                this.selectedObject = false;
            }
        }
    }
    _placeholder: string;

    @Input() errors: any[];
    @Input() onlyTop: boolean;
    
    @Output() onSelect: EventEmitter<object> = new EventEmitter();
    @Output() onOpen: EventEmitter<object> = new EventEmitter();
    @Output() onClose: EventEmitter<object> = new EventEmitter();
    @Output() onFocus: EventEmitter<object> = new EventEmitter();
    @Output() onBlur: EventEmitter<object> = new EventEmitter();

    @ViewChild('optionsWrap') optionsWrap: ElementRef;
    @ViewChild('selectWrap') selectWrap: ElementRef;

    @HostListener('window:keydown', ['$event']) globalHide(event: KeyboardEvent) {
        if (event.code === 'Escape') {
            this.hideOptions();
        }
    }

    constructor() {}

    ngOnInit() {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.options
            && changes.options.currentValue
            && JSON.stringify(changes.options.currentValue) !== JSON.stringify(changes.options.previousValue)
            && changes.options.previousValue !== undefined) {
            if (!this.fromComponent) {
                this._selected = null;
            }
        }
        if (changes.selected && changes.selected.currentValue) {
            setTimeout(() => {
                this.selected = changes.selected.currentValue;
            }, 0);
        }
        if (changes.options && changes.options.currentValue) {
            updateOptionNames(this.options, this.objectKey, this.objectCount, this.showCount);
        }
    }

    optionHasCount(option: any): boolean {
        return this.showCount || (option && !isNaN(option[this.objectCount]));
    }

    calcPosition(): string {
        const position = (window.innerHeight - this.selectWrap.nativeElement.offsetTop + 40);
        const comparison = position > 230;
        if (this.onlyTop) {
            return 'top';
        } else {
            return comparison ? 'bottom' : 'top';
        }
    }

    /*
      Toggle options visibility
     */
    toggleOptions(event?: MouseEvent): void {
        killEvent(event);
        if (event) {
            this.isVisible ? this.hideOptions() : this.showOptions();
        }
    }

    /*
      Hide options
     */
    hideOptions(): void {
        this.selectWrap.nativeElement.blur();
        this.isVisible = false;
        this.closed();
        this.onBlur.emit();
    }

    /*
      Show options
     */
    showOptions(): void {
        this.selectWrap.nativeElement.focus();
        this.isVisible = true;
        const currentIndex = this._selected ? this.options.indexOf(this._selected) : 0; // Index of selected item
        setTimeout(() => this.scrollToCurrent(currentIndex), 1);
        this.opened();
        this.onFocus.emit();
    }

    /*
      Scroll to selected option
     */
    scrollToCurrent(currentIndex: number): void {
        if (this.isVisible && this.optionsWrap) {
            const optionsWrap = this.optionsWrap.nativeElement; // Options list HTML element
            optionsWrap.scrollTop = (currentIndex - 2) * 40;
        }
    }

    /*
      Select option
     */
    selectItem(option: object, event?: Event): void {
        this.fromComponent = false;

        if (option) {
            this.selectedObject = true;
            // this._selected = option;
        }
        killEvent(event);
        this.onSelect.emit(option);
        
        this.hideOptions();
    }

    /*
      Arrows navigation
     */
    keyboardNavigation(event: KeyboardEvent) {
        const currentIndex = this.options.findIndex(item => {
            if (!this._selected) return null;
            return Number.isInteger(item) ? item === this._selected : item.id === this._selected.id;
        });
        switch (event.code) {
            case 'Space': {
                this.toggleOptions();
                break;
            }
            case 'ArrowDown': {
                if ((currentIndex + 1) !== this.options.length) {
                    this.onSelect.emit(this.options[currentIndex + 1]);
                    this.scrollToCurrent(currentIndex + 1);
                } else {
                    this.onSelect.emit(this.options[0]);
                    this.scrollToCurrent(0);
                }
                break;
            }
            case 'ArrowUp': {
                if (currentIndex > 0) {
                    this.onSelect.emit(this.options[currentIndex - 1]);
                    this.scrollToCurrent(currentIndex - 1);
                } else {
                    this.onSelect.emit(this.options[this.options.length - 1]);
                    this.scrollToCurrent(this.options.length - 1);
                }
                break;
            }
            case 'Enter': {
                if (this.isVisible) {
                    this.selectItem(this.options[currentIndex]);
                }
                break;
            }
            default:
                break;
        }
    }

    isCurrent(item) {
        return this._selected ? (Number.isInteger(item) ? item === this._selected : item.id === this._selected.id) : false;
    }

    opened() {
        this.onOpen.emit();
    }

    closed() {
        this.onClose.emit();
    }
}
