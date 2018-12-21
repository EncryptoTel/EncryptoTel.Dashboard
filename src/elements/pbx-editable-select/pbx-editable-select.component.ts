import {
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
    ViewChild,
    OnChanges,
    SimpleChanges
} from '@angular/core';

import { SwipeAnimation } from '@shared/swipe-animation';
import { SelectService } from '@services/state/select.service';
import {updateOptionNames} from '@shared/shared.functions';


@Component({
    selector: 'pbx-editable-select',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [SwipeAnimation('y', '200ms')]
})
export class EditableSelectComponent implements OnInit, OnChanges {
    public isVisible: boolean;
    public filterValue: string;
    public filteredSelectedItem: any;
    public filteredOptions: any[];
    public inFocus: boolean;

    private _placeholder: string;
    private _emptyOption: {} = { id: null };

    @Input() name: string;
    @Input() singleBorder: boolean;
    @Input()
    set options(options: any[]) {
        this._options = options;
        this.filterOptions();
    }

    _options: any[];

    @Input() objectKey: string;
    @Input() objectCount: string = 'optCount';
    @Input() showCount: boolean = false;

    @Input() 
        set selected(value: any) {
            if (this._options && Number(value)) {
                const option = this._options.find(o => o.id === +value);
                if (option) {
                    this._selected = option;
                }
            }
            else {
                this._selected = value;
            }
            
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

    constructor(private selectService: SelectService) {
        this.isVisible = false;
        this.inFocus = false;

        this.onSelect = new EventEmitter();
        this.onOpen = new EventEmitter();
        this.onClose = new EventEmitter();
        this.onFocus = new EventEmitter();
        this.onBlur = new EventEmitter();
    }

    ngOnInit(): void {
        this._emptyOption[this.objectKey] = 'No results found.';
        this.resetFilter();
        this.selectService.change.subscribe(isOpen => {
            if (isOpen) {
                this.isVisible = !isOpen;
            }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.selected && changes.selected.currentValue) {
            this.filteredSelectedItem = changes.selected.currentValue;
        }
        if (changes.options && changes.options.currentValue) {
            updateOptionNames(this._options, this.objectKey, this.objectCount, this.showCount);
        }
    }

    optionHasCount(option: any): boolean {
        return this.showCount || (option && !isNaN(option[this.objectCount]));
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
        if (Number.isInteger(item)) {
            return item === this.filteredSelectedItem;
        }
        if (Number(this.filteredSelectedItem)) {
            return item.id === +this.filteredSelectedItem;
        }
        return (
            item &&
            this.filteredSelectedItem &&
            item.id === this.filteredSelectedItem.id
        );
    }

    selectItem(option: any, event?: Event): void {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }

        if (option.id) {
            this.onSelect.emit(option);
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
        // this.onFocus.emit();
        this.setSelectInputFocus(true);
        this.scrollToCurrent(true);
    }

    hideOptions(): void {
        if (this.inFocus) this.setSelectCtrlFocus(true);
        this.isVisible = false;
        this.resetFilter();
        this.onClose.emit();
        // this.onBlur.emit();
    }

    filterOptions(): void {
        if (this.searchStartWith) {
            this.filteredOptions = this._options.filter(
                opt =>
                    !this.filterValue ||
                    opt[this.objectKey]
                        .toLowerCase()
                        .startsWith(this.filterValue.toLowerCase())
            );
        } else {
            this.filteredOptions = this._options.filter(
                opt =>
                    !this.filterValue ||
                    opt[this.objectKey]
                        .toLowerCase()
                        .search(this.filterValue.toLowerCase()) >= 0
            );
        }

        if (this.filteredOptions.length === 0) {
            this.filteredOptions.push(this._emptyOption);
        }
        this.filteredSelectedItem =
            this.filterValue && this.filteredOptions[0].id
                ? this.filteredOptions[0]
                : this._selected;

        this.scrollToCurrent();
    }

    resetFilter(): void {
        this.filterValue = '';
        this.filterOptions();
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
