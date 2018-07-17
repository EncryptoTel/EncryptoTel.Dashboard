import {Component, EventEmitter, Input, Output} from '@angular/core';
import {OnInit} from '@angular/core';

@Component({
  selector: 'pbx-form',
  templateUrl: './template.html',
  styleUrls: ['./local.sass']
})

export class FormComponent implements OnInit {
  selected: string;
  @Input() tabs;
  @Input() icons;
  @Input() background: boolean;
  @Input() confirm: {value: string, buttonType: string, inactive: boolean};
  @Input() decline: {value: string, buttonType: string, inactive: boolean};

  @Output() onConfirm: EventEmitter<void> = new EventEmitter<void>();
  @Output() onDecline: EventEmitter<void> = new EventEmitter<void>();
  @Output() onSelect: EventEmitter<string> = new EventEmitter<string>();


  selectingTab(text) {
    this.selected = text;
    this.onSelect.emit(text);
  }

  clickConfirm(): void {
    this.onConfirm.emit();
  }

  clickDecline(): void {
    this.onDecline.emit();
  }

  ngOnInit(): void {
    if (this.tabs) {this.selected = this.tabs[0]; }
  }
}
