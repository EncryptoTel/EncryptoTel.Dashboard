import {
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
    ViewChild,
    forwardRef
} from '@angular/core';

import { SwipeAnimation } from '@shared/swipe-animation';
import { SelectService } from '@services/state/select.service';
import { TranslateService } from '@ngx-translate/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';


@Component({
    selector: 'pbx-autocomplete',
    templateUrl: './pbx-autocomplete.html',
    styleUrls: ['./local.sass'],
    animations: [SwipeAnimation('y', '200ms')],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AutoCompleteComponent),
            multi: true
        }
    ],
})
export class AutoCompleteComponent implements OnInit, ControlValueAccessor {
    public isVisible: boolean;
    public value: string;
    public filteredSelectedItem: any;
    public filteredOptions: any[];
    public inFocus: boolean;

    private _placeholder: string;

    @Input() name: string;
    @Input()
    set options(options: any[]) {
        this._options = options;
        this.filterOptions(false);
    }

    _options: any[];

    @Input()
    set selected(value: any) {
        this._selected = value;
    } // read selectedItem

    _selected: any;
    @Input() errors: any[];
    @Input() searchStartWith: boolean = false;

    @Output() onSelect: EventEmitter<object>;
    @Output() onOpen: EventEmitter<object>;
    @Output() onClose: EventEmitter<object>;
    @Output() onFocus: EventEmitter<object>;
    @Output() onBlur: EventEmitter<object>;

    @ViewChild('optionsWrap') optionsWrap: ElementRef;
    @ViewChild('selectWrap') selectWrap: ElementRef;
    @ViewChild('selectInput') selectInput: ElementRef;

    // -- component lifecycle functions -------------------

    constructor(
        private selectService: SelectService,
        private translate: TranslateService
    ) {
        this.isVisible = false;
        this.inFocus = false;

        this.onSelect = new EventEmitter();
        this.onOpen = new EventEmitter();
        this.onClose = new EventEmitter();
        this.onFocus = new EventEmitter();
        this.onBlur = new EventEmitter();

    }

    onChangeValue() {
        this.onChange(this.value);
    }

    onChange: any = () => { };

    writeValue(obj: any): void {
        this.value = obj;
    }
    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {

    }
    setDisabledState?(isDisabled: boolean): void {
        console.log(isDisabled);
    }

    ngOnInit(): void {
        this.selectService.change.subscribe(isOpen => {
            if (isOpen) {
                this.isVisible = !isOpen;
            }
        });
    }

    // -- placeholder functions ---------------------------

    @Input()
    set placeholder(placeholder: string) {
        this._placeholder = placeholder;
    }

    get placeholder(): string {
        return this._placeholder;
    }

    get isPlaceholder(): boolean {
        return this.currentIndex < 0;
    }

    // -- selection functions -----------------------------

    get currentIndex(): number {
        return this.filteredOptions.findIndex(item =>
            this.isItemSelected(item)
        );
    }

    isItemSelected(item: any): boolean {
        return (
            item &&
            this.filteredSelectedItem &&
            item === this.filteredSelectedItem
        );
    }

    selectItem(option: any, event?: Event): void {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }

        if (option) {
            this.onSelect.emit(option);
            this.value = option;
            this.onChangeValue();
        }
        this.hideOptions();
    }

    setControlFocus(): void {
        this.inFocus = true;
        this.onFocus.emit();
    }

    clearControlFocus(): void {
        this.inFocus = false;
        this.onBlur.emit();
    }

    // -- event handlers ----------------------------------

    @HostListener('window:keydown', ['$event'])
    globalHide(event: KeyboardEvent): void {
        if (event.code === 'Escape') {
            this.hideOptions();
        }
    }

    inputKeyDown(event: KeyboardEvent): void {
        this.handleInputKeyboardEvent(event);
    }

    inputKeyUp(event: KeyboardEvent): void {
        if (['ArrowDown', 'ArrowUp', 'Enter', 'Tab'].indexOf(event.code) < 0) {
            this.filterOptions();
        }
    }

    ctrlKeyDown(event: KeyboardEvent): void {
        this.handleCtrlKeyboardEvent(event);
    }

    ctrlFocus(event: Event): void {
        this.setControlFocus();
    }

    inputMouseDown(event: MouseEvent): void {
        if (this.isVisible) this.hideOptions();
        this.killEvent(event);
    }

    ctrlMouseDown(event: MouseEvent): void {
        if (!this.inFocus) {
            this.setControlFocus();
            this.setSelectCtrlFocus(true);
        }
        this.toggleOptions();
        this.killEvent(event);
    }

    clickOutside(): void {
        if (this.inFocus) {
            this.clearControlFocus();
        }
        this.setSelectCtrlFocus(false);
        this.hideOptions();
    }

    setSelectCtrlFocus(state: boolean): void {
        if (state) {
            setTimeout(() => this.selectWrap.nativeElement.focus(), 0);
        } else {
            setTimeout(() => this.selectWrap.nativeElement.blur(), 0);
        }
    }

    setSelectInputFocus(state: boolean): void {
        if (state) {
            setTimeout(() => this.selectInput.nativeElement.focus(), 0);
        } else {
            setTimeout(() => this.selectInput.nativeElement.blur(), 0);
        }
    }

    handleInputKeyboardEvent(event: KeyboardEvent): void {
        switch (event.code) {
            case 'ArrowDown': {
                if (this.currentIndex + 1 !== this.filteredOptions.length) {
                    this.filteredSelectedItem = this.filteredOptions[
                        this.currentIndex + 1
                    ];
                    this.scrollToCurrent();
                } else {
                    this.filteredSelectedItem = this.filteredOptions[0];
                    this.scrollToCurrent();
                }
                this.killEvent(event);
                break;
            }
            case 'ArrowUp': {
                if (this.currentIndex > 0) {
                    this.filteredSelectedItem = this.filteredOptions[
                        this.currentIndex - 1
                    ];
                    this.scrollToCurrent();
                } else {
                    this.filteredSelectedItem = this.filteredOptions[
                        this.filteredOptions.length - 1
                    ];
                    this.scrollToCurrent();
                }
                this.killEvent(event);
                break;
            }
            case 'Enter': {
                this.selectItem(this.filteredOptions[this.currentIndex]);
                this.killEvent(event);
                break;
            }
            case 'Tab': {
                if (this.isVisible) this.hideOptions();
                this.clearControlFocus();
                break;
            }
        }
    }

    handleCtrlKeyboardEvent(event: KeyboardEvent): void {
        switch (event.code) {
            case 'Enter': {
                this.showOptions();
                break;
            }
            case 'Tab': {
                if (this.isVisible) this.hideOptions();
                this.clearControlFocus();
                break;
            }
        }
    }

    killEvent(event: Event): void {
        event.stopPropagation();
        event.preventDefault();
    }

    // -- dropdown & filtering ----------------------------

    toggleOptions(): void {
        this.isVisible ? this.hideOptions() : this.showOptions();
    }

    showOptions(): void {
        this.selectService.open();
        this.isVisible = true;
        this.onOpen.emit();
        this.setSelectInputFocus(true);
        this.scrollToCurrent(true);
    }

    hideOptions(): void {
        this.isVisible = false;
        this.onClose.emit();
    }

    filterOptions(autoOpen: boolean = true): void {
        if (this.searchStartWith) {
            this.filteredOptions = this._options.filter(
                opt =>
                    !this.value ||
                    opt
                        .toLowerCase()
                        .startsWith(this.value.toLowerCase())
            );
        } else {
            this.filteredOptions = this._options.filter(
                opt =>
                    !this.value || opt
                        .toLowerCase()
                        .search(this.value.toLowerCase()) >= 0
            );
        }

        if (this.filteredOptions.length === 0) {
            this.hideOptions();
        } else {
            if ((this.filterOptions.length === 1 && this.filterOptions[0] !== this.value) || this.filterOptions.length > 1 && autoOpen ) {
                this.showOptions();
            }
        }
    }

    // -- error handling ----------------------------------

    checkError(): string {
        return '';
    }

    // -- helpers -----------------------------------------

    calcPosition(): string {
        // const comparison = (window.innerHeight - this.selectWrap.nativeElement.offsetTop + 40) > 230;
        // return comparison ? 'bottom' : 'top';
        return 'bottom';
    }

    scrollToCurrent(deferred: boolean = false): void {
        if (this.isVisible && this.optionsWrap) {
            const optionsWrap = this.optionsWrap.nativeElement;
            const scrollFn = () => {
                optionsWrap.scrollTop = (this.currentIndex - 2) * 40;
            };
            deferred ? setTimeout(scrollFn, 0) : scrollFn();
        }
    }
}
