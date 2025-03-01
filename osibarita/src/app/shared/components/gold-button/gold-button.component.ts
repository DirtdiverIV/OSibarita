// src/app/shared/components/gold-button/gold-button.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-gold-button',
  templateUrl: './gold-button.component.html'
})
export class GoldButtonComponent {
  @Input() label: string = '';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled: boolean = false;
  @Output() btnClick = new EventEmitter<void>();

  onClick() {
    if (!this.disabled) {
      this.btnClick.emit();
    }
  }
}