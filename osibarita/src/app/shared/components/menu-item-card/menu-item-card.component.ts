// src/app/shared/components/menu-item-card/menu-item-card.component.ts
import { Component, Input } from '@angular/core';
import { MenuItem } from '../../../models';

@Component({
  selector: 'app-menu-item-card',
  templateUrl: './menu-item-card.component.html'
})
export class MenuItemCardComponent {
  @Input() item!: MenuItem;
}