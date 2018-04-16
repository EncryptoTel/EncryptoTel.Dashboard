import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'pbx-checkbox',
  templateUrl: './template.html',
  styleUrls: ['./local.sass']
})

export class CheckboxComponent {
  @Input() value: boolean;
  @Input() title: string;
  @Input() revert: string;
  @Output() onToggle: EventEmitter<boolean> = new EventEmitter<boolean>();
  toggleCheckbox(): void {
    this.value = !this.value;
    this.onToggle.emit(this.value);
  }
}
