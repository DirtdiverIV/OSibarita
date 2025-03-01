// src/app/shared/components/restaurant-card/restaurant-card.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-restaurant-card',
  templateUrl: './restaurant-card.component.html'
})
export class RestaurantCardComponent {
  @Input() title?: string;
}